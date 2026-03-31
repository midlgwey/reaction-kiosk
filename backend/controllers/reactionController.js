import { db } from '../db.js';
import { getShiftByTime } from '../utils/shiftUtils.js'; 
import { BadRequestError, InternalServerError } from '../errors/customErrors.js';
import { sendAlertTelegram } from '../utils/alertsUtils.js'; 
import crypto from 'crypto';

export const createReaction = async (req, res) => {
  
  try {
    const { waiter_id, table_number, responses } = req.body;

    const shift = getShiftByTime();

     // Validación de turno: No se permiten registros fuera de horario o en días cerrados
    if (shift === "Cerrado" || shift === "Fuera de horario") {
      throw new BadRequestError(`No se pueden registrar datos: Restaurante ${shift}`);
    }

    // Validación de campos obligatorios, incluyendo el número de mesa
    if (!waiter_id || !table_number || !responses || !Array.isArray(responses)) {
      throw new BadRequestError("Faltan datos críticos: mesero, mesa o el listado de respuestas.");
    }

    // Generamos un ID único para la encuesta
    const survey_id = crypto.randomUUID();

    //Mapeo de preguntas para las alertas de Telegram
    const listQuestions = {
      1: "Atención del mesero",
      2: "Tiempo de las bebidas",
      3: "Calidad de la comida",
      4: "Instalaciones del restaurante",
    };

    const waiterResult = await db.execute({
      sql: "SELECT name FROM waiters WHERE id = ?",
      args: [waiter_id]
    });

    // Si no existe el mesero, podrías usar un nombre genérico o manejar el error
    const waiterName = waiterResult.rows[0]?.name || "Mesero desconocido";

    //Procesamiento de Respuestas (Ciclo Protegido)
    for (const resp of responses) {
      const { question_id, value } = resp;

      // Validación de rango
      if (value < 1 || value > 4) continue; // Si una viene mal, saltamos a la siguiente para no romper todo

      // Guardamos la reacción en la base de datos
      const result = await db.execute({
        sql: `INSERT INTO reactions (question_id, value, waiter_id, table_number, shift, survey_id)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [question_id, value, waiter_id, table_number, shift, survey_id], 
      });

      // Si la calificación es mala (1), enviamos alerta a Telegram
      if (value === 1) {
        const questionText = listQuestions[question_id] || `Pregunta #${question_id}`;
        const messageAlert = `⚠️ ALERTA DE SERVICIO\n📍 Mesa: ${table_number}\n👤 Mesero ID: ${waiterName}\n📝 Problema: ${questionText}`;
        
        // Enviamos a Telegram
        await sendAlertTelegram(messageAlert);

        // Guardamos rastro de la alerta en la BD
        try {
          const newId = result.lastInsertRowid;
          await db.execute({
            sql: `INSERT INTO alerts (type, message, reaction_id) VALUES (?, ?, ?)`,
            args: ['calificacion_mala', messageAlert, Number(newId)]
          });
        } catch (e) {
          console.warn("No se pudo registrar el rastro de la alerta, pero el proceso continúa.");
        }
      }
    }

    // 7. Respuesta Final Exitosa
    res.status(201).json({ 
      message: "Encuesta completa registrada con éxito", 
      survey_id,
      shift 
    });

  } catch (error) {
    console.error("Error crítico en createReaction:", error);
    
    // Si es un error que nosotros definimos (400), lo lanzamos tal cual
    if (error.statusCode) throw error;
    
    // Si es un error de conexión o de código inesperado, lanzamos 500
    throw new InternalServerError("Error al procesar la encuesta completa");
  }
};