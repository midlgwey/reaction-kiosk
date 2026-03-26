import { db } from '../db.js';
import { InternalServerError } from '../errors/customErrors.js';

// Tijuana Invierno: '-8 hours' | Tijuana Verano: '-7 hours' (Ajustar según temporada)
const TIME_OFFSET = '-7 hours'; 

// Helper: Construye las condiciones de fecha dinámicas (Rangos exactos o últimos X días)
const getDateFilters = (req) => {
  const { startDate, endDate, days } = req.query;

  // Rango de fechas explícito
  if (startDate && endDate) {
    return {
      condition: `DATE(r.created_at, '${TIME_OFFSET}') BETWEEN DATE(?) AND DATE(?)`,
      args: [startDate, endDate],
    };
  }

  // Comportamiento por defecto (últimos X días)
  const dias = parseInt(days) || 7;
  const timeModifier = `-${dias - 1} days`;
  
  return {
    condition: `DATE(r.created_at, '${TIME_OFFSET}') >= DATE('now', '${TIME_OFFSET}', ?)`,
    args: [timeModifier],
  };
};

export const getRecentAlerts = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        /* 1. Traer los comentarios negativos */
        SELECT 
          'comment' as type,
          comment as content,
          datetime(created_at, '${TIME_OFFSET}') as date,
          created_at as raw_date
        FROM suggestions
        WHERE sentiment = 'Negative'

        UNION ALL

        /* 2. Traer las calificaciones malas (valor = 1) */
        SELECT 
          'rating' as type,
          q.text as content,
          datetime(r.created_at, '${TIME_OFFSET}') as date,
          r.created_at as raw_date
        FROM reactions r
        JOIN questions q ON r.question_id = q.id
        WHERE r.value = 1

        ORDER BY raw_date DESC
        LIMIT 5
      `
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error en getRecentAlerts:", error);
    res.status(500).json({ error: "No se pudieron cargar las alertas" });
  }
};