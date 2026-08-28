// backend/controllers/salesController.js
import { db } from "../db.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors/customErrors.js";

// ─── Helper: calcular días hábiles (sin lunes) ───────────────────────────────
const getWorkDays = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const today = new Date();

  let totalWorkDays = 0;
  let elapsedWorkDays = 0;

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 1) { // 1 = lunes
      totalWorkDays++;
      if (d <= today) elapsedWorkDays++;
    }
  }

  return { totalWorkDays, elapsedWorkDays };
};

// ─── GET /sales/goals/active ─────────────────────────────────────────────────
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
export const createSeason = async (req, res) => {
  const { season_year, season_start, season_end, global_goal, team_goal, waiter_goals } = req.body;
  const created_by = req.user.id;

  if (!season_year || !season_start || !season_end || !global_goal || !team_goal) {
    throw new BadRequestError("Faltan datos obligatorios de la temporada");
  }

  if (!waiter_goals || waiter_goals.length === 0) {
    throw new BadRequestError("Debes asignar metas a los meseros y capitanes");
  }

  const existing = await db.execute({
    sql: `SELECT goal_id FROM sales_goals WHERE season_year = ?`,
    args: [season_year]
  });

  if (existing.rows.length > 0) {
    throw new BadRequestError(`Ya existe una temporada configurada para ${season_year}`);
  }

  const insertSeason = await db.execute({
    sql: `INSERT INTO sales_goals (season_year, season_start, season_end, global_goal, team_goal, created_by)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [season_year, season_start, season_end, global_goal, team_goal, created_by]
  });

  const goal_id = Number(insertSeason.lastInsertRowid);

  for (const wg of waiter_goals) {
    if (!wg.employee_id || !wg.base_2025 || !wg.goal_amount) continue;
    await db.execute({
      sql: `INSERT INTO waiter_goals (goal_id, employee_id, base_2025, goal_amount)
            VALUES (?, ?, ?, ?)`,
      args: [goal_id, wg.employee_id, wg.base_2025, wg.goal_amount]
    });
  }

  res.status(StatusCodes.CREATED).json({
    message: "Temporada creada correctamente",
    goal_id
  });
};

// ─── GET /sales/monthly-goals/:month ─────────────────────────────────────────
// Traer metas del mes seleccionado con estado de configuración
export const getMonthlyGoals = async (req, res) => {
  const { month } = req.params; // formato: '08', '09', '10'
  const today = new Date().toISOString().split('T')[0];

  const seasonResult = await db.execute({
    sql: `SELECT * FROM sales_goals 
          WHERE season_start <= ? AND season_end >= ?
          LIMIT 1`,
    args: [today, today]
  });

  if (seasonResult.rows.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "No hay temporada activa."
    });
  }

  const season = seasonResult.rows[0];

  // Verificar qué meses ya están configurados
  const configuredMonths = await db.execute({
    sql: `SELECT DISTINCT month FROM monthly_goals WHERE goal_id = ?`,
    args: [season.goal_id]
  });

  const monthsConfigured = configuredMonths.rows.map(r => r.month);

  // Traer metas del mes solicitado
  const goalsResult = await db.execute({
    sql: `SELECT 
            mg.monthly_goal_id,
            mg.employee_id,
            mg.month,
            mg.base_prev_year,
            mg.goal_amount,
            e.first_name,
            e.last_name,
            e.position
          FROM monthly_goals mg
          JOIN employees e ON mg.employee_id = e.employee_id
          WHERE mg.goal_id = ? AND mg.month = ?
          ORDER BY e.position ASC, e.first_name ASC`,
    args: [season.goal_id, month]
  });

  res.status(StatusCodes.OK).json({
    season,
    month,
    months_configured: monthsConfigured,
    goals: goalsResult.rows
  });
};

// ─── POST /sales/monthly-goals ────────────────────────────────────────────────
// Configurar o reemplazar metas de un mes específico
export const saveMonthlyGoals = async (req, res) => {
  const { month, goals } = req.body;

  if (!month || !goals || goals.length === 0) {
    throw new BadRequestError("El mes y las metas son obligatorios");
  }

  const validMonths = ['08', '09', '10'];
  if (!validMonths.includes(month)) {
    throw new BadRequestError("El mes debe ser 08, 09 o 10");
  }

  const today = new Date().toISOString().split('T')[0];

  const seasonResult = await db.execute({
    sql: `SELECT goal_id FROM sales_goals 
          WHERE season_start <= ? AND season_end >= ?
          LIMIT 1`,
    args: [today, today]
  });

  if (seasonResult.rows.length === 0) {
    throw new BadRequestError("No hay temporada activa");
  }

  const goal_id = seasonResult.rows[0].goal_id;

  // Borrar metas anteriores del mes para reescribir
  await db.execute({
    sql: `DELETE FROM monthly_goals WHERE goal_id = ? AND month = ?`,
    args: [goal_id, month]
  });

  // Insertar nuevas metas
  for (const g of goals) {
    if (!g.employee_id || !g.base_prev_year || !g.goal_amount) continue;
    await db.execute({
      sql: `INSERT INTO monthly_goals (goal_id, employee_id, month, base_prev_year, goal_amount)
            VALUES (?, ?, ?, ?, ?)`,
      args: [goal_id, g.employee_id, month, g.base_prev_year, g.goal_amount]
    });
  }

  res.status(StatusCodes.CREATED).json({
    message: `Metas de ${month} guardadas correctamente`
  });
};

// ─── GET /sales/dashboard ─────────────────────────────────────────────────────
export const getSalesDashboard = async (req, res) => {
  const { month } = req.query; // formato: '08', '09', '10'
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const currentMonth = month || String(now.getMonth() + 1).padStart(2, '0');
  const currentYear = now.getFullYear();

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

  // Calcular días hábiles del mes seleccionado (sin lunes)
  const { totalWorkDays, elapsedWorkDays } = getWorkDays(currentYear, parseInt(currentMonth));

  // Verificar qué meses están configurados
  const configuredMonths = await db.execute({
    sql: `SELECT DISTINCT month FROM monthly_goals WHERE goal_id = ?`,
    args: [season.goal_id]
  });
  const monthsConfigured = configuredMonths.rows.map(r => r.month);

  // Traer metas mensuales + ventas acumuladas del mes
  const dashboardResult = await db.execute({
    sql: `SELECT 
            mg.monthly_goal_id,
            mg.employee_id,
            mg.goal_amount,
            mg.base_prev_year,
            e.first_name,
            e.last_name,
            e.position,
            COALESCE((
              SELECT SUM(ds.chiles_sold)
              FROM daily_sales ds
              WHERE ds.employee_id = mg.employee_id
                AND ds.goal_id = mg.goal_id
                AND strftime('%m', ds.sale_date) = ?
                AND strftime('%Y', ds.sale_date) = ?
            ), 0) AS month_sold,
            COALESCE((
              SELECT SUM(ds2.chiles_sold)
              FROM daily_sales ds2
              WHERE ds2.employee_id = mg.employee_id
                AND ds2.goal_id = mg.goal_id
            ), 0) AS total_sold
          FROM monthly_goals mg
          JOIN employees e ON mg.employee_id = e.employee_id
          WHERE mg.goal_id = ? AND mg.month = ?
          ORDER BY e.position ASC, e.first_name ASC`,
    args: [currentMonth, String(currentYear), season.goal_id, currentMonth]
  });

  // Calcular semáforo y meta alcanzada
  const employees = dashboardResult.rows.map(emp => {
    const dailyGoal = totalWorkDays > 0 ? emp.goal_amount / totalWorkDays : 0;
    const expectedToday = Math.ceil(dailyGoal * elapsedWorkDays);
    const monthSold = Number(emp.month_sold);
    const percentage = expectedToday > 0
      ? Math.round((monthSold / expectedToday) * 100)
      : monthSold > 0 ? 100 : 0;

    let status;
    if (percentage >= 100) status = 'green';
    else if (percentage >= 90) status = 'orange';
    else if (percentage >= 80) status = 'blue';
    else status = 'red';

    // Meta alcanzada — solo se evalúa si el mes ya terminó
    const monthEnd = new Date(currentYear, parseInt(currentMonth), 0);
    const monthFinished = now > monthEnd;
    const goalReached = monthFinished ? monthSold >= emp.goal_amount : null;

    return {
      ...emp,
      monthly_goal: emp.goal_amount,
      daily_goal: Math.ceil(dailyGoal),
      expected_today: expectedToday,
      month_sold: monthSold,
      total_sold: Number(emp.total_sold),
      percentage,
      status,
      goal_reached: goalReached
    };
  });

  // Meta global — total de la temporada
  const globalSoldResult = await db.execute({
    sql: `SELECT COALESCE(SUM(chiles_sold), 0) AS global_sold
          FROM daily_sales WHERE goal_id = ?`,
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
    months_configured: monthsConfigured,
    current_month: currentMonth,
    month_configured: monthsConfigured.includes(currentMonth),
    employees
  });
};

// ─── GET /sales/daily/:employee_id ───────────────────────────────────────────
export const getEmployeeSales = async (req, res) => {
  const { employee_id } = req.params;
  const { month } = req.query;

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
  const filterMonth = month || String(new Date().getMonth() + 1).padStart(2, '0');
  const filterYear = String(new Date().getFullYear());

  const salesResult = await db.execute({
    sql: `SELECT * FROM daily_sales
          WHERE employee_id = ?
            AND goal_id = ?
            AND strftime('%m', sale_date) = ?
            AND strftime('%Y', sale_date) = ?
          ORDER BY sale_date DESC`,
    args: [employee_id, goal_id, filterMonth, filterYear]
  });

  res.status(StatusCodes.OK).json({
    sales: salesResult.rows
  });
};

// ─── POST /sales/daily ────────────────────────────────────────────────────────
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

  const seasonResult = await db.execute({
    sql: `SELECT goal_id FROM sales_goals
          WHERE season_start <= ? AND season_end >= ?
          LIMIT 1`,
    args: [sale_date, sale_date]
  });

  if (seasonResult.rows.length === 0) {
    throw new BadRequestError("La fecha no corresponde a ninguna temporada activa");
  }

  const goal_id = seasonResult.rows[0].goal_id;

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