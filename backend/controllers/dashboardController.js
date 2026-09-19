import { db } from '../db.js';
import { InternalServerError } from '../errors/customErrors.js';
import { getShiftByTime } from '../utils/shiftUtils.js';
import { sendAlertTelegram } from '../utils/alertsUtils.js';
import { TIME_OFFSET, EXCLUDE_TEST, getDateFilters } from '../utils/queryHelpers.js';

// Total de reacciones del día
export const getDailyReactions = async (req, res) => {
  try {
    const [todayResult, yesterdayResult] = await Promise.all([
      db.execute({
        sql: `
          SELECT COUNT(*) AS total
          FROM reactions
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
          ${EXCLUDE_TEST}
        `,
      }),
      db.execute({
        sql: `
          SELECT COUNT(*) AS total
          FROM reactions
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}', '-1 day')
          ${EXCLUDE_TEST}
        `,
      })
    ]);

    const today = todayResult.rows[0].total || 0;
    const yesterday = yesterdayResult.rows[0].total || 0;
    const trend = today - yesterday;

    res.status(200).json({
      totalReactionsToday: today,
      trend: trend,
      yesterdayTotal: yesterday
    });

  } catch (error) {
    throw new InternalServerError("Error obteniendo reacciones");
  }
};

// Promedio de calificación del servicio del mesero (Pregunta 1)
export const getDailyServerScore = async (req, res) => {
  try {
    const [todayResult, yesterdayResult] = await Promise.all([
      db.execute({
        sql: `
          SELECT 
            COALESCE(ROUND(AVG(value),2), 0) AS avg_score,
            COUNT(id) AS total_votes
          FROM reactions
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
          AND question_id = 1
          ${EXCLUDE_TEST}
        `,
      }),
      db.execute({
        sql: `
          SELECT 
            COALESCE(ROUND(AVG(value),2), 0) AS avg_score,
            COUNT(id) AS total_votes
          FROM reactions
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}', '-1 day')
          AND question_id = 1
          ${EXCLUDE_TEST}
        `,
      })
    ]);

    const today = todayResult.rows[0];
    const yesterday = yesterdayResult.rows[0];
    const trend = today.avg_score - yesterday.avg_score;

    res.status(200).json({
      avgScore: today.avg_score,
      totalResponses: today.total_votes,
      trend: parseFloat(trend.toFixed(2)),
      yesterdayScore: yesterday.avg_score
    });
  } catch (error) {
    throw new InternalServerError("Error servicio mesero");
  }
};

// Meseros con menos encuestas por turno del día
// Desayuno: mínimo 2 encuestas | Comida/Cena: mínimo 1
// Excluye de Comida/Cena a los meseros que ya aparecen en Desayuno
// Obtiene a los 2 meseros con menos encuestas por cada turno (mínimo 1 encuesta)
export const getLowInteractionWaiters = async (req, res) => {
  try {
    const [breakfastResult, lunchResult] = await Promise.all([

      // Desayuno — solo meseros que SÍ trabajaron (encuestas > 0), los 2 con menos
      db.execute({
        sql: `
          SELECT
            w.name AS mesero,
            'Desayuno' AS turno,
            COUNT(DISTINCT r.survey_id) AS encuestas
          FROM waiters w
          JOIN reactions r ON w.id = r.waiter_id
            AND DATE(r.created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
            AND r.shift = 'Desayuno'
          WHERE w.active = 1
          AND w.is_test = 0
          GROUP BY w.id, w.name
          HAVING encuestas > 0
          ORDER BY encuestas ASC
          LIMIT 2
        `
      }),

      // Comida/Cena — mismo criterio
      db.execute({
        sql: `
          SELECT
            w.name AS mesero,
            'Comida/Cena' AS turno,
            COUNT(DISTINCT r.survey_id) AS encuestas
          FROM waiters w
          JOIN reactions r ON w.id = r.waiter_id
            AND DATE(r.created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
            AND r.shift = 'Comida/Cena'
          WHERE w.active = 1
          AND w.is_test = 0
          GROUP BY w.id, w.name
          HAVING encuestas > 0
          ORDER BY encuestas ASC
          LIMIT 2
        `
      })
    ]);

    const breakfast = breakfastResult.rows;
    const lunch = lunchResult.rows;

    // Sin datos en ningún turno
    if (breakfast.length === 0 && lunch.length === 0) {
      return res.status(200).json([]);
    }

    const result = [
      ...breakfast.map(row => ({
        mesero: row.mesero,
        turno: row.turno,
        encuestas: row.encuestas || 0,
        unico: breakfast.length === 1 
      })),
      ...lunch.map(row => ({
        mesero: row.mesero,
        turno: row.turno,
        encuestas: row.encuestas || 0,
        unico: lunch.length === 1  
      }))
    ];

    res.status(200).json(result);

  } catch (error) {
    throw new InternalServerError("Error meseros con poca interacción");
  }
};

// Conteo de encuestas realizadas y rechazadas del día
export const getDailySurveyCount = async (req, res) => {
  try {
    const [todayResult, yesterdayResult, todayDeclinesResult, yesterdayDeclinesResult] = await Promise.all([
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
          SELECT COUNT(DISTINCT survey_id) AS total
          FROM reactions
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}', '-1 day')
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
      }),
      db.execute({
        sql: `
          SELECT COUNT(*) AS total
          FROM declines
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}', '-1 day')
          ${EXCLUDE_TEST}
        `
      })
    ]);

    const todaySurveys = todayResult.rows[0]?.total || 0;
    const yesterdaySurveys = yesterdayResult.rows[0]?.total || 0;
    const todayDeclines = todayDeclinesResult.rows[0]?.total || 0;
    const yesterdayDeclines = yesterdayDeclinesResult.rows[0]?.total || 0;

    const trendSurveys = todaySurveys - yesterdaySurveys;
    const trendDeclines = todayDeclines - yesterdayDeclines;

    res.status(200).json({
      realizadas: todaySurveys,
      rechazadas: todayDeclines,
      trendSurveys: trendSurveys,
      trendDeclines: trendDeclines,
      yesterdaySurveys: yesterdaySurveys,
      yesterdayDeclines: yesterdayDeclines
    });

  } catch (error) {
    throw new InternalServerError("Error conteo diario de encuestas");
  }
};

// Mesero con baja calificación del día (promedio más bajo)
// Solo incluye meseros con >= 2 encuestas (datos confiables)
export const getLowestRatedWaiter = async (req, res) => {
  try {
    const [todayResult, yesterdayResult] = await Promise.all([
      // Hoy — Solo meseros con >= 2 encuestas
      db.execute({
        sql: `
          SELECT
            w.name AS mesero,
            COALESCE(ROUND(AVG(r.value), 2), 0) AS avg_score,
            COUNT(r.id) AS total_respuestas
          FROM waiters w
          LEFT JOIN reactions r ON w.id = r.waiter_id
            AND DATE(r.created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
            AND r.question_id = 1
          WHERE w.active = 1 AND w.is_test = 0
          GROUP BY w.id, w.name
          HAVING COUNT(r.id) >= 2
          ORDER BY avg_score ASC, total_respuestas ASC
          LIMIT 1
        `
      }),
      // Ayer — Solo meseros con >= 2 encuestas
      db.execute({
        sql: `
          SELECT
            w.name AS mesero,
            COALESCE(ROUND(AVG(r.value), 2), 0) AS avg_score,
            COUNT(r.id) AS total_respuestas
          FROM waiters w
          LEFT JOIN reactions r ON w.id = r.waiter_id
            AND DATE(r.created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}', '-1 day')
            AND r.question_id = 1
          WHERE w.active = 1 AND w.is_test = 0
          GROUP BY w.id, w.name
          HAVING COUNT(r.id) >= 2
          ORDER BY avg_score ASC, total_respuestas ASC
          LIMIT 1
        `
      })
    ]);

    const today = todayResult.rows[0];
    const yesterday = yesterdayResult.rows[0];

    // Calcular trend
    let trend = 0;
    if (today && yesterday) {
      trend = today.avg_score - yesterday.avg_score;
    } else if (today && !yesterday) {
      trend = today.avg_score > 0 ? 1 : 0;
    }

    res.status(200).json({
      mesero: today?.mesero || "Sin datos",
      avgScore: today?.avg_score || 0,
      totalResponses: today?.total_respuestas || 0,
      trend: parseFloat(trend.toFixed(2)),
      yesterdayScore: yesterday?.avg_score || null
    });

  } catch (error) {
    console.error("Error en getLowestRatedWaiter:", error);
    throw new InternalServerError("Error obteniendo mesero con baja calificación");
  }
};

// Pregunta peor calificada del día
export const getWorstRatedQuestion = async (req, res) => {
  try {
    const [todayResult, yesterdayResult] = await Promise.all([
      // Hoy
      db.execute({
        sql: `
          SELECT 
            question_id,
            COALESCE(ROUND(AVG(value), 2), 0) AS avg_score,
            COUNT(*) AS total_responses
          FROM reactions
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
          AND waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
          GROUP BY question_id
          ORDER BY avg_score ASC
          LIMIT 1
        `
      }),
      // Ayer
      db.execute({
        sql: `
          SELECT 
            question_id,
            COALESCE(ROUND(AVG(value), 2), 0) AS avg_score,
            COUNT(*) AS total_responses
          FROM reactions
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}', '-1 day')
          AND waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
          GROUP BY question_id
          ORDER BY avg_score ASC
          LIMIT 1
        `
      })
    ]);

    const QUESTION_LABELS = {
      1: '¿Qué le pareció el servicio de su mesero?',
      2: '¿Las bebidas llegaron en el tiempo esperado?',
      3: '¿Los alimentos servidos cumplieron sus expectativas?',
      4: '¿Nuestras instalaciones estuvieron a la altura de su visita?'
    };

    const today = todayResult.rows[0];
    const yesterday = yesterdayResult.rows[0];

    // Calcular trend
    let trend = 0;
    if (today && yesterday) {
      trend = today.avg_score - yesterday.avg_score;
    } else if (today && !yesterday) {
      trend = today.avg_score > 0 ? 1 : 0;
    }

    res.status(200).json({
      questionId: today?.question_id || null,
      questionLabel: QUESTION_LABELS[today?.question_id] || "Sin datos",
      avgScore: today?.avg_score || 0,
      totalResponses: today?.total_responses || 0,
      trend: parseFloat(trend.toFixed(2)),
      yesterdayScore: yesterday?.avg_score || null
    });

  } catch (error) {
    console.error("Error en getWorstRatedQuestion:", error);
    throw new InternalServerError("Error obteniendo pregunta peor calificada");
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