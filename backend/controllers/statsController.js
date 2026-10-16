import { db } from '../db.js';
import { NotFoundError, InternalServerError } from '../errors/customErrors.js';
import { TIME_OFFSET, EXCLUDE_TEST_JOIN, getDateFilters, getPreviousPeriodFilters } from '../utils/queryHelpers.js';

/**
 * Calcula la dirección y el label de un trend comparando dos valores.
 * threshold: diferencia mínima para considerarse un cambio real (evita ruido de ±0.1%)
 */
function buildTrend(current, previous, threshold = 1) {
  if (previous === null || previous === undefined || previous === 0) {
    return { direction: 'flat', diffLabel: 'Sin datos previos' };
  }

  const diff = current - previous;

  if (Math.abs(diff) < threshold) {
    return { direction: 'flat', diffLabel: 'Sin cambios' };
  }

  const direction = diff > 0 ? 'up' : 'down';
  const diffLabel = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;

  return { direction, diffLabel };
}

// Pregunta con mejor calificación promedio — con trend vs semana anterior
export const getBestQuestionWeek = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    const prevFilter = getPreviousPeriodFilters(req);
    const MIN_VOTES = 5;

    const result = await db.execute({
      sql: `
        SELECT 
          q.text AS question,
          ROUND(AVG(r.value), 2) AS avg_score,
          COUNT(r.id) AS total_votes
        FROM reactions r
        JOIN questions q ON q.id = r.question_id
        WHERE ${filter.condition}
        ${EXCLUDE_TEST_JOIN}
        GROUP BY r.question_id
        HAVING COUNT(r.id) >= ${MIN_VOTES}
        ORDER BY avg_score DESC, total_votes DESC
        LIMIT 1;
      `,
      args: filter.args
    });

    const best = result.rows[0] || null;

    if (!best) {
      return res.status(200).json({ bestQuestionWeek: null });
    }

    const prevResult = await db.execute({
      sql: `
        SELECT ROUND(AVG(r.value), 2) AS avg_score
        FROM reactions r
        JOIN questions q ON q.id = r.question_id
        WHERE q.text = ?
        AND ${prevFilter.condition}
        ${EXCLUDE_TEST_JOIN};
      `,
      args: [best.question, ...prevFilter.args]
    });

    const prevAvg = prevResult.rows[0]?.avg_score;
    const currentPct = Math.round((best.avg_score / 4) * 100);
    const prevPct = prevAvg ? Math.round((prevAvg / 4) * 100) : null;

    const trend = buildTrend(currentPct, prevPct);

    res.status(200).json({ 
      bestQuestionWeek: { ...best, trend } 
    });
  } catch (error) {
    console.error("Error en getBestQuestionWeek:", error);
    throw new InternalServerError("Error obteniendo mejor pregunta");
  }
};

// Pregunta con peor calificación promedio — con trend vs semana anterior
export const getWorstQuestionWeek = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    const prevFilter = getPreviousPeriodFilters(req);
    const MIN_VOTES = 5;

    const result = await db.execute({
      sql: `
        SELECT 
          q.text AS question,
          ROUND(AVG(r.value), 2) AS avg_score,
          COUNT(r.id) AS total_votes
        FROM reactions r
        JOIN questions q ON q.id = r.question_id
        WHERE ${filter.condition}
        ${EXCLUDE_TEST_JOIN}
        GROUP BY r.question_id
        HAVING COUNT(r.id) >= ${MIN_VOTES}
        ORDER BY avg_score ASC, total_votes DESC
        LIMIT 1;
      `,
      args: filter.args
    });

    const worst = result.rows[0] || null;

    if (!worst) {
      return res.status(200).json({ worstQuestionWeek: null });
    }

    const prevResult = await db.execute({
      sql: `
        SELECT ROUND(AVG(r.value), 2) AS avg_score
        FROM reactions r
        JOIN questions q ON q.id = r.question_id
        WHERE q.text = ?
        AND ${prevFilter.condition}
        ${EXCLUDE_TEST_JOIN};
      `,
      args: [worst.question, ...prevFilter.args]
    });

    const prevAvg = prevResult.rows[0]?.avg_score;
    const currentPct = Math.round((worst.avg_score / 4) * 100);
    const prevPct = prevAvg ? Math.round((prevAvg / 4) * 100) : null;

    const trend = buildTrend(currentPct, prevPct);

    res.status(200).json({ 
      worstQuestionWeek: { ...worst, trend } 
    });
  } catch (error) {
    console.error("Error en getWorstQuestionWeek:", error);
    throw new InternalServerError("Error obteniendo peor pregunta");
  }
};

// Total de rechazos de encuesta — semana actual vs semana anterior
export const getWeeklyDeclinesTrend = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    const prevFilter = getPreviousPeriodFilters(req);

    const [currentResult, prevResult] = await Promise.all([
      db.execute({
        sql: `
          SELECT COUNT(*) AS total
          FROM declines r
          WHERE ${filter.condition}
          AND r.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1);
        `,
        args: filter.args
      }),
      db.execute({
        sql: `
          SELECT COUNT(*) AS total
          FROM declines r
          WHERE ${prevFilter.condition}
          AND r.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1);
        `,
        args: prevFilter.args
      })
    ]);

    const current = currentResult.rows[0]?.total || 0;
    const previous = prevResult.rows[0]?.total || 0;

    const diff = current - previous;
    let trend;
    if (previous === 0 && current === 0) {
      trend = { direction: 'flat', diffLabel: 'Sin datos previos' };
    } else if (diff === 0) {
      trend = { direction: 'flat', diffLabel: 'Sin cambios' };
    } else {
      // Invertido a propósito: menos rechazos = bueno = verde
      trend = {
        direction: diff > 0 ? 'down' : 'up',
        diffLabel: `${diff > 0 ? '+' : ''}${diff} vs semana pasada`
      };
    }

    res.status(200).json({ total: current, previous, trend });
  } catch (error) {
    console.error("Error en getWeeklyDeclinesTrend:", error);
    throw new InternalServerError("Error obteniendo rechazos semanales");
  }
};

// Total de encuestas realizadas — semana actual vs semana anterior
export const getWeeklyTotalSurveys = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    const prevFilter = getPreviousPeriodFilters(req);

    const [currentResult, prevResult] = await Promise.all([
      db.execute({
        sql: `
          SELECT COUNT(DISTINCT r.survey_id) AS total
          FROM reactions r
          WHERE ${filter.condition}
          ${EXCLUDE_TEST_JOIN};
        `,
        args: filter.args
      }),
      db.execute({
        sql: `
          SELECT COUNT(DISTINCT r.survey_id) AS total
          FROM reactions r
          WHERE ${prevFilter.condition}
          ${EXCLUDE_TEST_JOIN};
        `,
        args: prevFilter.args
      })
    ]);

    const current = currentResult.rows[0]?.total || 0;
    const previous = prevResult.rows[0]?.total || 0;

    const diff = current - previous;
    let trend;
    if (previous === 0 && current === 0) {
      trend = { direction: 'flat', diffLabel: 'Sin datos previos' };
    } else if (diff === 0) {
      trend = { direction: 'flat', diffLabel: 'Sin cambios' };
    } else {
      const pct = previous > 0 ? Math.round((diff / previous) * 100) : 0;
      trend = {
        direction: diff > 0 ? 'up' : 'down',
        diffLabel: `${diff > 0 ? '+' : ''}${pct}% vs semana pasada`
      };
    }

    res.status(200).json({ total: current, previous, trend });
  } catch (error) {
    console.error("Error en getWeeklyTotalSurveys:", error);
    throw new InternalServerError("Error obteniendo total de encuestas");
  }
};

// Distribución de respuestas por pregunta — alimenta la gráfica de barras semanal
export const getWeeklySurveyChart = async (req, res) => {
  try {
    const filter = getDateFilters(req);

    const result = await db.execute({
      sql: `
        SELECT
          q.text AS question,
          SUM(CASE WHEN r.value = 4 THEN 1 ELSE 0 END) AS excelente,
          SUM(CASE WHEN r.value = 3 THEN 1 ELSE 0 END) AS bueno,
          SUM(CASE WHEN r.value = 2 THEN 1 ELSE 0 END) AS puede_mejorar,
          SUM(CASE WHEN r.value = 1 THEN 1 ELSE 0 END) AS malo
        FROM reactions r
        JOIN questions q ON q.id = r.question_id
        WHERE ${filter.condition}
        ${EXCLUDE_TEST_JOIN}
        GROUP BY q.id
        ORDER BY q.id;
      `,
      args: filter.args
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al armar la gráfica de barras:", error);
    throw new InternalServerError("Error gráfico por pregunta semanal");
  }
};

// Radar comparativo — semana seleccionada vs semana anterior
// Soporta rango de fechas exacto o los últimos 7/13 días por defecto
export const getWeeklyComparisonRadar = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql, args;

    if (startDate && endDate) {
      const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      sql = `
        SELECT
          q.text as question,
          COALESCE(ROUND(AVG(CASE 
            WHEN DATE(r.created_at,'${TIME_OFFSET}') BETWEEN DATE(?) AND DATE(?)
            THEN r.value END
          ) * 25, 1), 0) as current_week_score,
          COALESCE(ROUND(AVG(CASE 
            WHEN DATE(r.created_at,'${TIME_OFFSET}') >= DATE(?, '-${diffDays} days')
            AND DATE(r.created_at,'${TIME_OFFSET}') < DATE(?)
            THEN r.value END
          ) * 25, 1), 0) as last_week_score
        FROM questions q
        LEFT JOIN reactions r ON r.question_id = q.id
          AND r.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
        GROUP BY q.id
        ORDER BY q.id;
      `;
      args = [startDate, endDate, startDate, startDate];
    } else {
      sql = `
        SELECT
          q.text as question,
          COALESCE(ROUND(AVG(CASE 
            WHEN r.created_at >= datetime('now','${TIME_OFFSET}','-6 days')
            THEN r.value END
          ) * 25, 1), 0) as current_week_score,
          COALESCE(ROUND(AVG(CASE 
            WHEN r.created_at < datetime('now','${TIME_OFFSET}','-6 days')
            AND r.created_at >= datetime('now','${TIME_OFFSET}','-13 days')
            THEN r.value END
          ) * 25, 1), 0) as last_week_score
        FROM questions q
        LEFT JOIN reactions r ON r.question_id = q.id
          AND r.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
        GROUP BY q.id
        ORDER BY q.id;
      `;
      args = [];
    }

    const result = await db.execute({ sql, args });
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error en radar:", error);
    throw new InternalServerError("Error radar semanal");
  }
};

// Satisfacción por turno y día — alimenta la gráfica de barras agrupadas
export const getOverallDistributionWeek = async (req, res) => {
  try {
    const filter = getDateFilters(req);

    const result = await db.execute({
      sql: `
        SELECT 
          DATE(r.created_at,'${TIME_OFFSET}') as day,
          r.shift,
          r.value,
          COUNT(*) as total
        FROM reactions r
        WHERE ${filter.condition}
          AND r.shift IS NOT NULL
          ${EXCLUDE_TEST_JOIN}
        GROUP BY day, r.shift, r.value
        ORDER BY day ASC;
      `,
      args: filter.args
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error en distribucion turnos:", error);
    throw new InternalServerError("Error distribución turnos semanal");
  }
};

// Día de la semana con mejor promedio de satisfacción (mínimo 5 respuestas)
export const getWeeklyDayStrong = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    const MIN_RESPONSES = 5;

    const condition = filter.condition.replace(/r\.created_at/g, 'created_at');

    const result = await db.execute({
      sql: `
      WITH days AS (
        SELECT 
          DATE(created_at, '${TIME_OFFSET}') as day,
          COALESCE(AVG(value), 0) as avg_score,
          COUNT(*) as total_responses
        FROM reactions
        WHERE ${condition}
        AND waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
        GROUP BY day
        HAVING COUNT(*) >= ${MIN_RESPONSES}
      )
      SELECT
        day,
        CASE strftime('%w', day)
          WHEN '0' THEN 'Domingo'
          WHEN '1' THEN 'Lunes'
          WHEN '2' THEN 'Martes'
          WHEN '3' THEN 'Miércoles'
          WHEN '4' THEN 'Jueves'
          WHEN '5' THEN 'Viernes'
          WHEN '6' THEN 'Sábado'
        END as day_name,
        ROUND((avg_score / 4.0) * 100, 0) as satisfaction_percent,
        total_responses
      FROM days
      ORDER BY avg_score DESC, total_responses DESC
      LIMIT 1;
      `,
      args: filter.args
    });

    res.status(200).json(result.rows[0] || null);
  } catch (error) {
    console.error("Error en getWeeklyDayStrong:", error);
    throw new InternalServerError("Error obteniendo día fuerte");
  }
};

// Día de la semana con peor promedio de satisfacción (mínimo 5 respuestas)
export const getWeeklyDayWeak = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    const MIN_RESPONSES = 5;

    const condition = filter.condition.replace(/r\.created_at/g, 'created_at');

    const result = await db.execute({
      sql: `
      WITH days AS (
        SELECT 
          DATE(created_at, '${TIME_OFFSET}') as day,
          COALESCE(AVG(value), 0) as avg_score,
          COUNT(*) as total_responses
        FROM reactions
        WHERE ${condition}
        AND waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
        GROUP BY day
        HAVING COUNT(*) >= ${MIN_RESPONSES}
      )
      SELECT
        day,
        CASE strftime('%w', day)
          WHEN '0' THEN 'Domingo'
          WHEN '1' THEN 'Lunes'
          WHEN '2' THEN 'Martes'
          WHEN '3' THEN 'Miércoles'
          WHEN '4' THEN 'Jueves'
          WHEN '5' THEN 'Viernes'
          WHEN '6' THEN 'Sábado'
        END as day_name,
        ROUND((avg_score / 4.0) * 100, 0) as satisfaction_percent,
        total_responses
      FROM days
      ORDER BY avg_score ASC, total_responses DESC
      LIMIT 1;
      `,
      args: filter.args
    });

    res.status(200).json(result.rows[0] || null);
  } catch (error) {
    console.error("Error en getWeeklyDayWeak:", error);
    throw new InternalServerError("Error obteniendo día débil");
  }
};

// Aceptación de encuestas por día — realizadas vs rechazadas
// Soporta rango de fechas exacto o últimos X días
export const getSurveyAcceptanceByDay = async (req, res) => {
  try {
    const filter = getDateFilters(req);
 
    // Adaptamos el condition para las tablas sin alias 'r'
    let conditionFixed = filter.condition;
    if (conditionFixed.includes('r.created_at')) {
      conditionFixed = conditionFixed.replace(/r\.created_at/g, 'created_at');
    }
 
    const [surveysResult, declinesResult] = await Promise.all([
      // Encuestas realizadas agrupadas por día
      db.execute({
        sql: `
          SELECT 
            DATE(created_at, '${TIME_OFFSET}') AS day,
            COUNT(DISTINCT survey_id) AS realizadas
          FROM reactions
          WHERE ${conditionFixed}
          AND waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
          GROUP BY day
          ORDER BY day ASC
        `,
        args: filter.args
      }),
      // Encuestas rechazadas agrupadas por día
      db.execute({
        sql: `
          SELECT 
            DATE(created_at, '${TIME_OFFSET}') AS day,
            COUNT(*) AS rechazadas
          FROM declines
          WHERE ${conditionFixed}
          AND waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
          GROUP BY day
          ORDER BY day ASC
        `,
        args: filter.args
      })
    ]);
 
    // Merge por día
    const dayMap = {};
 
    surveysResult.rows.forEach(row => {
      dayMap[row.day] = { day: row.day, realizadas: row.realizadas || 0, rechazadas: 0 };
    });
 
    declinesResult.rows.forEach(row => {
      if (dayMap[row.day]) {
        dayMap[row.day].rechazadas = row.rechazadas || 0;
      } else {
        dayMap[row.day] = { day: row.day, realizadas: 0, rechazadas: row.rechazadas || 0 };
      }
    });
 
    // Ordenar por fecha y calcular % de aceptación por día
    const result = Object.values(dayMap)
      .sort((a, b) => a.day.localeCompare(b.day))
      .map(row => {
        const total = row.realizadas + row.rechazadas;
        return {
          ...row,
          total,
          pctAceptacion: total > 0 ? Math.round((row.realizadas / total) * 100) : 0,
        };
      });
 
    res.status(200).json(result);
 
  } catch (error) {
    console.error('Error en getSurveyAcceptanceByDay:', error);
    throw new InternalServerError('Error obteniendo aceptación por día');
  }
};

// Evolución de satisfacción por pregunta a lo largo del tiempo
// - Excluye días sin encuestas (restaurante cerrado, lunes, etc.)
// - Agrupa por día (≤30d), semana (≤180d) o mes (>180d)
// Endpoint: GET /stats/question-trend?days=7
export const getQuestionTrend = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    const days = parseInt(req.query.days) || 7;
 
    const QUESTION_LABELS = {
      1: 'Servicio del mesero',
      2: 'Bebidas a tiempo',
      3: 'Calidad de alimentos',
      4: 'Instalaciones',
    };
 
    // Determinar granularidad según el rango solicitado
    let groupExpr, labelType;
    if (days <= 30) {
      groupExpr = `DATE(r.created_at, '${TIME_OFFSET}')`;
      labelType = 'day';
    } else if (days <= 180) {
      groupExpr = `strftime('%Y-%W', r.created_at, '${TIME_OFFSET}')`;
      labelType = 'week';
    } else {
      groupExpr = `strftime('%Y-%m', r.created_at, '${TIME_OFFSET}')`;
      labelType = 'month';
    }
 
    // Query sin RECURSIVE — solo días/semanas/meses que tienen datos reales
    // Así los lunes cerrados y días sin encuestas no aparecen con 0
    const sql = `
      SELECT
        ${groupExpr} AS period,
        r.question_id,
        ROUND(AVG(r.value), 2) AS avg_score,
        COUNT(r.id) AS total_responses
      FROM reactions r
      WHERE ${filter.condition}
      AND r.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
      AND r.question_id IN (1, 2, 3, 4)
      GROUP BY period, r.question_id
      HAVING COUNT(r.id) >= 1
      ORDER BY period ASC, r.question_id ASC;
    `;
 
    const result = await db.execute({ sql, args: filter.args });
 
    // Períodos únicos ordenados (días, semanas o meses según granularidad)
    const periodsSet = [...new Set(result.rows.map(r => r.period))];
 
    // Armar una serie por pregunta con null donde no hay datos ese periodo
    const questions = [1, 2, 3, 4].map(qid => ({
      id: qid,
      label: QUESTION_LABELS[qid],
      data: periodsSet.map(period => {
        const row = result.rows.find(r => r.period === period && r.question_id === qid);
        return row ? parseFloat(row.avg_score) : null; // null = no se dibuja el punto
      }),
      totalResponses: result.rows
        .filter(r => r.question_id === qid)
        .reduce((sum, r) => sum + (r.total_responses || 0), 0),
    }));
 
    res.status(200).json({ labels: periodsSet, questions, labelType });
 
  } catch (error) {
    console.error('Error en getQuestionTrend:', error);
    throw new InternalServerError('Error obteniendo evolución por pregunta');
  }
};