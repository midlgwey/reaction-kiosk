import { db } from '../db.js';
import { StatusCodes } from 'http-status-codes';
import { InternalServerError, BadRequestError } from '../errors/customErrors.js';
import { getShiftByTime } from '../utils/shiftUtils.js';
import { sendAlertTelegram } from '../utils/alertsUtils.js'; // ✅

export const createDecline = async (req, res) => {
  const { waiter_id, table_number } = req.body;

  if (!waiter_id || !table_number) {
    throw new BadRequestError('Se requiere ID de mesero y número de mesa');
  }

  const shift = getShiftByTime();

  try {
    // Buscamos el nombre del mesero
    const waiterResult = await db.execute({
      sql: `SELECT name FROM waiters WHERE id = ?`,
      args: [waiter_id]
    });
    const waiterName = waiterResult.rows[0]?.name || 'Sin nombre';

    // Guardamos el rechazo
    const result = await db.execute({
      sql: `INSERT INTO declines (waiter_id, table_number, shift) VALUES (?, ?, ?)`,
      args: [waiter_id, table_number, shift]
    });

    // Mensaje de alerta
    const message = `⚠️ ENCUESTA RECHAZADA\n👤 Mesero: ${waiterName}\n📍 Mesa: ${table_number}\n🕐 Turno: ${shift}`;

    // Enviamos alerta a Telegram
    await sendAlertTelegram(message);

    //Guardamos en tabla alerts
    try {
      await db.execute({
        sql: `INSERT INTO alerts (type, message) VALUES (?, ?)`,
        args: ['rechazo_encuesta', message]
      });
    } catch (e) {
      console.warn("No se pudo guardar en alerts, pero el proceso continúa.");
    }

    res.status(StatusCodes.CREATED).json({ 
      success: true, 
      message: "Rechazo registrado" 
    });

  } catch (error) {
    console.error("Error al registrar rechazo:", error);
    throw new InternalServerError("No se pudo registrar el rechazo");
  }
};