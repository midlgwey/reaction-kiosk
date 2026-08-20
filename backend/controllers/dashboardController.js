import { db } from '../db.js';
import { InternalServerError } from '../errors/customErrors.js';
import { getShiftByTime } from '../utils/shiftUtils.js';
import { sendAlertTelegram } from '../utils/alertsUtils.js';
import { TIME_OFFSET, EXCLUDE_TEST, getDateFilters } from '../utils/queryHelpers.js';

// Total de reacciones del día
export const getDailyReactions = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) AS total
        FROM reactions
        WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
        ${EXCLUDE_TEST}
      `,
    });

    res.status(200).json({
      totalReactionsToday: result.rows[0].total || 0
    });

  } catch (error) {
    throw new InternalServerError("Error obteniendo reacciones");
  }
};

// Promedio de calificación del servicio del mesero (Pregunta 1)
export const getDailyServerScore = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          COALESCE(ROUND(AVG(value),2), 0) AS avg_score,
          COUNT(id) AS total_votes
        FROM reactions
        WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
        AND question_id = 1
        ${EXCLUDE_TEST}
      `,
    });

    res.status(200).json({
      avgScore: result.rows[0].avg_score,
      totalResponses: result.rows[0].total_votes
    });
  } catch (error) {
    throw new InternalServerError("Error servicio mesero");
  }
};

// Mesero con menos encuestas por turno del día
// Desayuno: mínimo 2 encuestas | Comida/Cena: mínimo 1
// Excluye de Comida/Cena a los meseros que ya aparecen en Desayuno
// Obtiene a los 2 meseros con menos encuestas por cada turno (mínimo 1 encuesta)
export const getLowInteractionWaiters = async (req, res) => {
  try {
    // Ejecutamos ambas consultas al mismo tiempo para que sea más rápido
    const [breakfastResult, lunchResult] = await Promise.all([
      
      // 1. Buscamos a los 2 con menos encuestas del turno Desayuno
      db.execute({
        sql: `
          SELECT
            w.name AS mesero,
            'Desayuno' AS turno,
            COUNT(DISTINCT r.survey_id) AS encuestas
          FROM waiters w
          JOIN reactions r ON w.id = r.waiter_id -- Cambiado de LEFT JOIN a JOIN
            AND DATE(r.created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
            AND r.shift = 'Desayuno'
          WHERE w.active = 1
          AND w.is_test = 0
          GROUP BY w.id, w.name
          ORDER BY encuestas ASC
          LIMIT 2 
        `
      }),
      
      // 2. Buscamos a los 2 con menos encuestas del turno Comida/Cena
      db.execute({
        sql: `
          SELECT
            w.name AS mesero,
            'Comida/Cena' AS turno,
            COUNT(DISTINCT r.survey_id) AS encuestas
          FROM waiters w
          JOIN reactions r ON w.id = r.waiter_id -- Cambiado de LEFT JOIN a JOIN
            AND DATE(r.created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
            AND r.shift = 'Comida/Cena'
          WHERE w.active = 1
          AND w.is_test = 0
          GROUP BY w.id, w.name
          ORDER BY encuestas ASC
          LIMIT 2 
        `
      })
    ]);

    // Unimos los resultados de ambos turnos en una sola lista
    const result = [
      ...breakfastResult.rows,
      ...lunchResult.rows
    ];

    // Enviamos la respuesta limpia al frontend
    res.status(200).json(result.map(row => ({
      mesero: row.mesero,
      turno: row.turno,
      encuestas: row.encuestas || 0
    })));

  } catch (error) {
    throw new InternalServerError("Error meseros con poca interacción");
  }
};

// Conteo de encuestas realizadas y rechazadas del día
export const getDailySurveyCount = async (req, res) => {
  try {
    const [surveysResult, declinesResult] = await Promise.all([
      db.execute({
        sql: `
          SELECT COUNT(DISTINCT survey_id) AS total
          FROM reactions
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
          ${EXCLUDE_TEST}
        `
      }),
      db.execute({
        sql: `
          SELECT COUNT(*) AS total
          FROM declines
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
          ${EXCLUDE_TEST}
        `
      })
    ]);

    res.status(200).json({
      realizadas: surveysResult.rows[0]?.total || 0,
      rechazadas: declinesResult.rows[0]?.total || 0,
    });

  } catch (error) {
    throw new InternalServerError("Error conteo diario de encuestas");
  }
};

// Evolución de satisfacción por día — alimenta la gráfica de área
// Soporta rango de fechas exacto o últimos X días
export const getDailySatisfactionTrend = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    let sql, args;

    if (filter.condition.includes('BETWEEN')) {
      sql = `
      WITH RECURSIVE days(day) AS (
        SELECT DATE(?)
        UNION ALL
        SELECT DATE(day,'+1 day')
        FROM days
        WHERE day < DATE(?)
      )
      SELECT 
        days.day,
        COALESCE(ROUND(AVG(r.value),2),0) as avg_satisfaction,
        COUNT(r.id) as total_responses
      FROM days
      LEFT JOIN reactions r 
        ON DATE(r.created_at, '${TIME_OFFSET}') = days.day
        AND r.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
      GROUP BY days.day
      ORDER BY days.day ASC;
      `;
      args = [filter.args[0], filter.args[1]];
    } else {
      sql = `
      WITH RECURSIVE days(day) AS (
        SELECT DATE('now', '${TIME_OFFSET}', ?)
        UNION ALL
        SELECT DATE(day,'+1 day')
        FROM days
        WHERE day < DATE('now', '${TIME_OFFSET}')
      )
      SELECT 
        days.day,
        COALESCE(ROUND(AVG(r.value),2),0) as avg_satisfaction,
        COUNT(r.id) as total_responses
      FROM days
      LEFT JOIN reactions r 
        ON DATE(r.created_at, '${TIME_OFFSET}') = days.day
        AND r.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
      GROUP BY days.day
      ORDER BY days.day ASC;
      `;
      args = filter.args;
    }

    const result = await db.execute({ sql, args });
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error en getDailySatisfactionTrend:", error);
    throw new InternalServerError("Error evolución temporal");
  }
};

// Distribución de respuestas por pregunta — alimenta las barras apiladas del dashboard
export const getDailyQuestions = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    
    // El helper regresa r.created_at pero esta query no usa alias r
    let conditionFixed = filter.condition;
    if (conditionFixed.includes('r.created_at')) {
      conditionFixed = conditionFixed.replace(/r\.created_at/g, 'created_at');
    }

    const result = await db.execute({
      sql: `
        SELECT 
          question_id,
          COALESCE(SUM(CASE WHEN value = 4 THEN 1 ELSE 0 END), 0) AS excelente,
          COALESCE(SUM(CASE WHEN value = 3 THEN 1 ELSE 0 END), 0) AS bueno,
          COALESCE(SUM(CASE WHEN value = 2 THEN 1 ELSE 0 END), 0) AS regular,
          COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0) AS malo,
          COUNT(*) as total_respuestas
        FROM reactions
        WHERE ${conditionFixed}
        ${EXCLUDE_TEST}
        GROUP BY question_id
        ORDER BY question_id ASC;
      `,
      args: filter.args
    });

    const QUESTION_LABELS = {
      1: '¿Qué le pareció el servicio de su mesero?',
      2: '¿Las bebidas llegaron en el tiempo esperado?',
      3: '¿Los alimentos servidos cumplieron sus expectativas?',
      4: '¿Nuestras instalaciones estuvieron a la altura de su visita?'
    };

    const formattedData = result.rows.map(row => ({
      id: row.question_id,
      label: QUESTION_LABELS[row.question_id] || `Pregunta ${row.question_id}`,
      totalRespuestas: row.total_respuestas,
      respuestas: {
        excelente: row.excelente,
        bueno: row.bueno,
        regular: row.regular,
        malo: row.malo
      }
    }));

    res.status(200).json(formattedData);

  } catch (error) {
    console.error("Error en getDailyQuestions:", error);
    throw new InternalServerError("Error obteniendo la radiografía de preguntas");
  }
};

export const checkInactivity = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT COUNT(DISTINCT survey_id) AS total
        FROM reactions
        WHERE created_at >= datetime('now', '-1 hours')
        AND waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
      `
    });

    const total = result.rows[0]?.total || 0;

    if (total === 0) {
      const shift = getShiftByTime();

      // No manda alerta si el restaurante está cerrado
      if (shift === 'Cerrado' || shift === 'Fuera de horario') {
        return res.status(200).json({ message: "Restaurante cerrado, sin alerta" });
      }

      const alertMessage = `⚠️ ALERTA DE INACTIVIDAD\nTurno: ${shift}\n\nNo se han registrado encuestas en la última hora.\nVerifica que el kiosco esté funcionando correctamente.`;

      await sendAlertTelegram(alertMessage);
    }

    res.status(200).json({ total, alerta: total === 0 });

  } catch (error) {
    console.error("Error en checkInactivity:", error);
    throw new InternalServerError("Error verificando inactividad");
  }
};