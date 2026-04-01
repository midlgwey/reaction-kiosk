import { db } from '../db.js';
import { StatusCodes } from 'http-status-codes';
import { InternalServerError, BadRequestError } from '../errors/customErrors.js';
import { getShiftByTime } from '../utils/shiftUtils.js';

export const createDecline = async (req, res) => {
  const { waiter_id, table_number } = req.body;

  if (!waiter_id || !table_number) {
    throw new BadRequestError('Se requiere ID de mesero y número de mesa');
  }

  const shift = getShiftByTime();

  try {
    await db.execute({
      sql: `INSERT INTO declines (waiter_id, table_number, shift) VALUES (?, ?, ?)`,
      args: [waiter_id, table_number, shift]
    });

    res.status(StatusCodes.CREATED).json({ 
      success: true, 
      message: "Rechazo registrado" 
    });

  } catch (error) {
    console.error("Error al registrar rechazo:", error);
    throw new InternalServerError("No se pudo registrar el rechazo");
  }
};