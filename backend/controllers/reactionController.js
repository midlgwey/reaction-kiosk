import { db } from '../db.js';
import { getShiftByTime } from '../utils/shiftUtils.js'; 
import { BadRequestError, InternalServerError } from '../errors/customErrors.js';
import { sendAlertTelegram } from '../utils/alertsUtils.js'; 

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

    // Insertar en BD y capturar el resultado
    const result = await db.execute({
      sql: `INSERT INTO reactions (question_id, value, shift) VALUES (?, ?, ?)`,
      args: [question_id, value, shift],
    });

    // Extraer el ID de la reacción recién creada
    const newReactionId = result.lastInsertRowid;

    // Lógica de Alertas: Si el valor es 1 (Malo)
    if (value === 1) {

      const listQuestions = {
        1: "Atención del mesero",
        2: "Calidad de las bebidas",
        3: "Sabor/Calidad de la comida",
        4: "Instalaciones"
      };

      const questionText = listQuestions[question_id] || `Pregunta #${question_id}`;
      const messageAlert = `⚠️ Alerta de Servicio: Se registró una calificación MALA en: ${questionText}.`;
      

      // Guardar en la tabla alerts para el Dashboard
      await db.execute({
        sql: `INSERT INTO alerts (type, message, reaction_id) VALUES (?, ?, ?)`,
        args: ['calificacion', messageAlert, Number(newReactionId)]
      });

      // Ejecutar la función para notificar al gerente
      await sendAlertTelegram(messageAlert);
    }

    res.status(201).json({ message: "Reacción guardada", shift });

  } catch (error) {
    console.error("Error createReaction:", error);

    // Si es error de validación (400), se deja pasar
    if (error.statusCode) throw error;
    
    // Error inesperado (BD, código, etc)
    throw new InternalServerError("Error al guardar reacción");
  }
};

