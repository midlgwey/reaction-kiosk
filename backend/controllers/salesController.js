// backend/controllers/salesController.js
import { db } from "../db.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/customErrors.js";

// ─── GET /sales/goals/active ─────────────────────────────────────────────────
// Obtener la temporada activa con sus metas individuales
export const getActiveSeason = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const seasonResult = await db.execute({
    sql: `SELECT * FROM sales_goals 
          WHERE season_start <= ? AND season_end >= ?
          LIMIT 1`,
    args: [today, today]
  });

  if (seasonResult.rows.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "No hay una temporada activa en este momento."
    });
  }

  const season = seasonResult.rows[0];

  // Traer metas individuales con datos del empleado
  const goalsResult = await db.execute({
    sql: `SELECT 
            wg.waiter_goal_id,
            wg.employee_id,
            wg.base_2025,
            wg.goal_amount,
            e.first_name,
            e.last_name,
            e.position
          FROM waiter_goals wg
          JOIN employees e ON wg.employee_id = e.employee_id
          WHERE wg.goal_id = ?
          ORDER BY e.position ASC, e.first_name ASC`,
    args: [season.goal_id]
  });

  res.status(StatusCodes.OK).json({
    season,
    waiter_goals: goalsResult.rows
  });
};

// ─── POST /sales/goals ────────────────────────────────────────────────────────
// Crear temporada + metas individuales (solo admin)
export const createSeason = async (req, res) => {
  const { season_year, season_start, season_end, global_goal, team_goal, waiter_goals } = req.body;
  const created_by = req.user.id;

  if (!season_year || !season_start || !season_end || !global_goal || !team_goal) {
    throw new BadRequestError("Faltan datos obligatorios de la temporada");
  }

  if (!waiter_goals || waiter_goals.length === 0) {
    throw new BadRequestError("Debes asignar metas individuales a los meseros y capitanes");
  }

  // Verificar que no exista ya una temporada para ese año
  const existing = await db.execute({
    sql: `SELECT goal_id FROM sales_goals WHERE season_year = ?`,
    args: [season_year]
  });

  if (existing.rows.length > 0) {
    throw new BadRequestError(`Ya existe una temporada configurada para ${season_year}`);
  }

  // Crear la temporada
  const insertSeason = await db.execute({
    sql: `INSERT INTO sales_goals (season_year, season_start, season_end, global_goal, team_goal, created_by)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [season_year, season_start, season_end, global_goal, team_goal, created_by]
  });

  const goal_id = Number(insertSeason.lastInsertRowid);

  // Insertar metas individuales
  for (const wg of waiter_goals) {
    if (!wg.employee_id || !wg.base_2025 || !wg.goal_amount) continue;

    await db.execute({
      sql: `INSERT INTO waiter_goals (goal_id, employee_id, base_2025, goal_amount)
            VALUES (?, ?, ?, ?)`,
      args: [goal_id, wg.employee_id, wg.base_2025, wg.goal_amount]
    });
  }

  res.status(StatusCodes.CREATED).json({
    message: "Temporada y metas creadas correctamente",
    goal_id
  });
};

// ─── GET /sales/dashboard ─────────────────────────────────────────────────────
// Dashboard principal — ventas acumuladas + semáforo por mesero
export const getSalesDashboard = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  // Obtener temporada activa
  const seasonResult = await db.execute({
    sql: `SELECT * FROM sales_goals 
          WHERE season_start <= ? AND season_end >= ?
          LIMIT 1`,
    args: [today, today]
  });

  if (seasonResult.rows.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "No hay una temporada activa."
    });
  }

  const season = seasonResult.rows[0];

  // Calcular días hábiles del mes (mar-dom, sin lunes)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let totalWorkDays = 0;
  let elapsedWorkDays = 0;

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 1) { // 1 = lunes
      totalWorkDays++;
      if (d <= now) elapsedWorkDays++;
    }
  }

  // Traer metas individuales + ventas acumuladas del mes actual
  const dashboardResult = await db.execute({
    sql: `SELECT 
            wg.waiter_goal_id,
            wg.employee_id,
            wg.goal_amount,
            e.first_name,
            e.last_name,
            e.position,
            COALESCE(SUM(ds.chiles_sold), 0) AS total_sold,
            COALESCE((
              SELECT SUM(ds2.chiles_sold)
              FROM daily_sales ds2
              WHERE ds2.employee_id = wg.employee_id
                AND ds2.goal_id = wg.goal_id
                AND strftime('%Y-%m', ds2.sale_date) = strftime('%Y-%m', ?)
            ), 0) AS month_sold
          FROM waiter_goals wg
          JOIN employees e ON wg.employee_id = e.employee_id
          LEFT JOIN daily_sales ds 
            ON ds.employee_id = wg.employee_id 
            AND ds.goal_id = wg.goal_id
          WHERE wg.goal_id = ?
          GROUP BY wg.employee_id
          ORDER BY e.position ASC, e.first_name ASC`,
    args: [today, season.goal_id]
  });

  // Calcular semáforo por mesero
  const employees = dashboardResult.rows.map(emp => {
    const monthlyGoal = Math.ceil(emp.goal_amount / 3); // meta anual / 3 meses
    const dailyGoal = Math.ceil(monthlyGoal / totalWorkDays);
    const expectedToday = dailyGoal * elapsedWorkDays;
    const percentage = expectedToday > 0
      ? Math.round((emp.month_sold / expectedToday) * 100)
      : 100;

    let status;
    if (percentage >= 100) status = 'green';
    else if (percentage >= 90) status = 'orange';
    else if (percentage >= 80) status = 'blue';
    else status = 'red';

    return {
      ...emp,
      monthly_goal: monthlyGoal,
      daily_goal: dailyGoal,
      expected_today: expectedToday,
      month_sold: Number(emp.month_sold),
      total_sold: Number(emp.total_sold),
      percentage,
      status
    };
  });

  // Meta global — sumar todos los chiles vendidos en la temporada
  const globalSoldResult = await db.execute({
    sql: `SELECT COALESCE(SUM(chiles_sold), 0) AS global_sold
          FROM daily_sales
          WHERE goal_id = ?`,
    args: [season.goal_id]
  });

  const global_sold = Number(globalSoldResult.rows[0].global_sold);
  const global_percentage = Math.round((global_sold / season.global_goal) * 100);

  res.status(StatusCodes.OK).json({
    season,
    global_sold,
    global_percentage,
    total_work_days: totalWorkDays,
    elapsed_work_days: elapsedWorkDays,
    employees
  });
};

// ─── GET /sales/daily/:employee_id ───────────────────────────────────────────
// Historial de ventas diarias de un empleado
export const getEmployeeSales = async (req, res) => {
  const { employee_id } = req.params;
  const { month } = req.query; // formato: 2026-08

  const today = new Date().toISOString().split('T')[0];

  const seasonResult = await db.execute({
    sql: `SELECT goal_id FROM sales_goals 
          WHERE season_start <= ? AND season_end >= ?
          LIMIT 1`,
    args: [today, today]
  });

  if (seasonResult.rows.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "No hay temporada activa."
    });
  }

  const goal_id = seasonResult.rows[0].goal_id;
  const filterMonth = month || today.substring(0, 7);

  const salesResult = await db.execute({
    sql: `SELECT * FROM daily_sales
          WHERE employee_id = ?
            AND goal_id = ?
            AND strftime('%Y-%m', sale_date) = ?
          ORDER BY sale_date DESC`,
    args: [employee_id, goal_id, filterMonth]
  });

  res.status(StatusCodes.OK).json({
    sales: salesResult.rows
  });
};

// ─── POST /sales/daily ────────────────────────────────────────────────────────
// Registrar venta diaria (admin y supervisor)
export const registerDailySale = async (req, res) => {
  const { employee_id, sale_date, chiles_sold, notes } = req.body;
  const registered_by = req.user.id;

  if (!employee_id || !sale_date || chiles_sold === undefined) {
    throw new BadRequestError("employee_id, sale_date y chiles_sold son obligatorios");
  }

  if (chiles_sold < 0) {
    throw new BadRequestError("El número de chiles no puede ser negativo");
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(sale_date)) {
    throw new BadRequestError("La fecha debe tener formato yyyy-MM-dd");
  }

  // Verificar que el empleado sea mesero o capitán
  const empCheck = await db.execute({
    sql: `SELECT position FROM employees WHERE employee_id = ?`,
    args: [employee_id]
  });

  if (empCheck.rows.length === 0) {
    throw new BadRequestError("El empleado no existe");
  }

  const validPositions = ['Mesero', 'Capitan'];
  if (!validPositions.includes(empCheck.rows[0].position)) {
    throw new BadRequestError("Solo se pueden registrar ventas de meseros y capitanes");
  }

  // Obtener goal_id de temporada activa
  const seasonResult = await db.execute({
    sql: `SELECT goal_id FROM sales_goals
          WHERE season_start <= ? AND season_end >= ?
          LIMIT 1`,
    args: [sale_date, sale_date]
  });

  if (seasonResult.rows.length === 0) {
    throw new BadRequestError("La fecha ingresada no corresponde a ninguna temporada activa");
  }

  const goal_id = seasonResult.rows[0].goal_id;

  // Verificar duplicado — UNIQUE (employee_id, sale_date)
  const duplicate = await db.execute({
    sql: `SELECT sale_id FROM daily_sales WHERE employee_id = ? AND sale_date = ?`,
    args: [employee_id, sale_date]
  });

  if (duplicate.rows.length > 0) {
    throw new BadRequestError(
      "Ya existe un registro para este empleado en esa fecha. Usa modificar para corregirlo."
    );
  }

  await db.execute({
    sql: `INSERT INTO daily_sales (employee_id, goal_id, sale_date, chiles_sold, notes, registered_by)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [employee_id, goal_id, sale_date, chiles_sold, notes || null, registered_by]
  });

  res.status(StatusCodes.CREATED).json({
    message: "Venta registrada correctamente"
  });
};

// ─── PATCH /sales/daily/:sale_id ─────────────────────────────────────────────
// Modificar venta (corrección de error) — admin y supervisor
export const updateDailySale = async (req, res) => {
  const { sale_id } = req.params;
  const { chiles_sold, notes } = req.body;
  const registered_by = req.user.id;

  if (chiles_sold === undefined) {
    throw new BadRequestError("chiles_sold es obligatorio para modificar");
  }

  if (chiles_sold < 0) {
    throw new BadRequestError("El número de chiles no puede ser negativo");
  }

  const check = await db.execute({
    sql: `SELECT sale_id FROM daily_sales WHERE sale_id = ?`,
    args: [sale_id]
  });

  if (check.rows.length === 0) {
    throw new BadRequestError("El registro de venta no existe");
  }

  await db.execute({
    sql: `UPDATE daily_sales 
          SET chiles_sold = ?, 
              notes = ?,
              registered_by = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE sale_id = ?`,
    args: [chiles_sold, notes || null, registered_by, sale_id]
  });

  res.status(StatusCodes.OK).json({
    message: "Venta actualizada correctamente"
  });
};