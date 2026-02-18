import { db } from '../db.js';
import { getShiftByTime } from '../utils/shiftUtils.js'; 
import { BadRequestError, InternalServerError } from '../errors/customErrors.js';

export const createReaction = async (req, res) => {
  try {
    const { question_id, value } = req.body;

    // Calculamos turno con hora de Tijuana
    const shift = getShiftByTime();

    // Validaciones básicas
    if (!question_id || !value) {
      throw new BadRequestError("Faltan datos (question_id o value)");
    }

    // Validar rango de estrellas
    if (value < 1 || value > 4) {
      throw new BadRequestError("Valor inválido (1-4)");
    }

    // Si está cerrado, no guardamos nada
    if (shift === "Cerrado" || shift === "Fuera de horario") {
      throw new BadRequestError("Restaurante cerrado");
    }

    // Insertar en BD
    await db.execute({
      sql: `INSERT INTO reactions (question_id, value, shift) VALUES (?, ?, ?)`,
      args: [question_id, value, shift],
    });

    res.status(201).json({ message: "Reacción guardada", shift });

  } catch (error) {
    console.error("Error createReaction:", error);

    // Si es error de validación (400), se deja pasar
    if (error.statusCode) throw error;
    
    // Error inesperado (BD, código, etc)
    throw new InternalServerError("Error al guardar reacción");
  }
};

