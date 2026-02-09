import { db } from '../db.js';
import { getShiftByTime } from '../utils/shiftUtils.js';
import { BadRequestError, InternalServerError } from '../errors/customErrors.js';

export const createReaction = async (req, res) => {
   try {
    const { question_id, value } = req.body;

    // Aquí logueas lo que llega en la petición
    console.log("BODY RECIBIDO:", req.body);

    const shift = getShiftByTime();

    // Aquí logueas el turno determinado
    console.log("SHIFT DETERMINADO:", shift);

    if (!question_id || !value) {
      throw new BadRequestError("question_id y value son obligatorios");
    }

    if (value < 1 || value > 4) {
      throw new BadRequestError("Valor de reacción inválido");
    }

    if (shift === "Cerrado" || shift === "Fuera de horario") {
      throw new BadRequestError("El restaurante está cerrado");
    }

    await db.execute({
      sql: `INSERT INTO reactions (question_id, value, shift) VALUES (?, ?, ?)`,
      args: [question_id, value, shift],
    });

    res.status(201).json({ message: "Reacción guardada", shift });

  } catch (error) {
    throw new InternalServerError("Error guardando reacción");
  }
};