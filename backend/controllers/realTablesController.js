import { db } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, InternalServerError } from '../errors/customErrors.js';

const TIME_OFFSET = '-7 hours';

// Captura o actualiza la captura de mesas reales del día (upsert)
export const captureRealTables = async (req, res) => {
  const { waiter_id, date, table_count } = req.body;

  if (!waiter_id || !date || table_count === undefined) {
    throw new BadRequestError("waiter_id, date y table_count son obligatorios");
  }

  try {
    const id = uuidv4();

    await db.execute({
      sql: `
        INSERT INTO realtables (id, waiter_id, date, table_count)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(waiter_id, date)
        DO UPDATE SET table_count = excluded.table_count
      `,
      args: [id, waiter_id, date, table_count]
    });

    res.status(StatusCodes.OK).json({ message: "Captura guardada exitosamente" });
  } catch (error) {
    console.error("Error al capturar mesas reales:", error);
    throw new InternalServerError("Error al guardar la captura");
  }
};

// Obtiene el historial de capturas de un mes específico
export const getRealTablesByMonth = async (req, res) => {
  const { month, year } = req.query;

  const now = new Date();
  const targetMonth = parseInt(month) || (now.getMonth() + 1);
  const targetYear = parseInt(year) || now.getFullYear();

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${lastDay}`;

  try {
    const result = await db.execute({
      sql: `
        SELECT
          rt.id,
          rt.waiter_id,
          w.name AS mesero,
          rt.date,
          rt.table_count
        FROM realtables rt
        LEFT JOIN waiters w ON rt.waiter_id = w.id
        WHERE rt.date BETWEEN ? AND ?
        ORDER BY rt.date DESC
      `,
      args: [startDate, endDate]
    });

    res.status(StatusCodes.OK).json(result.rows);
  } catch (error) {
    console.error("Error al obtener historial de mesas reales:", error);
    throw new InternalServerError("Error al obtener historial");
  }
};

// Editar un registro específico
export const updateRealTable = async (req, res) => {
  const { id } = req.params;
  const { table_count } = req.body;

  if (table_count === undefined) {
    throw new BadRequestError("table_count es obligatorio");
  }

  try {
    await db.execute({
      sql: `UPDATE realtables SET table_count = ? WHERE id = ?`,
      args: [table_count, id]
    });

    res.status(StatusCodes.OK).json({ message: "Registro actualizado" });
  } catch (error) {
    console.error("Error al actualizar registro:", error);
    throw new InternalServerError("Error al actualizar");
  }
};

// Eliminar un registro
export const deleteRealTable = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute({
      sql: `DELETE FROM realtables WHERE id = ?`,
      args: [id]
    });

    res.status(StatusCodes.OK).json({ message: "Registro eliminado" });
  } catch (error) {
    console.error("Error al eliminar registro:", error);
    throw new InternalServerError("Error al eliminar");
  }
};