import { db } from '../db.js';
import { NotFoundError, InternalServerError } from '../errors/customErrors.js';

const TIME_OFFSET = '-7 hours';

// Subquery reutilizable para excluir al tester
const EXCLUDE_TEST = `AND r.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)`;

const getDateFilters = (req) => {
  const { startDate, endDate, days } = req.query;

  if (startDate && endDate) {
    return {
      condition: `DATE(r.created_at, '${TIME_OFFSET}') BETWEEN DATE(?) AND DATE(?)`,
      args: [startDate, endDate],
      isRadar: false
    };
  }

  const dias = parseInt(days) || 7;
  const timeModifier = `-${dias - 1} days`;
  
  return {
    condition: `DATE(r.created_at, '${TIME_OFFSET}') >= DATE('now', '${TIME_OFFSET}', ?)`,
    args: [timeModifier],
    isRadar: false
  };
};

export const getBestQuestionWeek = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    const MIN_VOTES = 5;

    const result = await db.execute({
      sql: `
        SELECT 
          q.text AS question,
          ROUND(AVG(r.value), 2) AS avg_score,
          COUNT(r.id) AS total_votes
        FROM reactions r
        JOIN questions q ON q.id = r.question_id
        WHERE ${filter.condition.replace(/r\.created_at/g, 'r.created_at')}
        ${EXCLUDE_TEST}
        GROUP BY r.question_id
        HAVING COUNT(r.id) >= ${MIN_VOTES}
        ORDER BY avg_score DESC, total_votes DESC
        LIMIT 1;
      `,
      args: filter.args
    });

    res.status(200).json({ bestQuestionWeek: result.rows[0] || null });
  } catch (error) {
    console.error("Error en getBestQuestionWeek:", error);
    throw new InternalServerError("Error obteniendo mejor pregunta");
  }
};

export const getWorstQuestionWeek = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    const MIN_VOTES = 5;

    const result = await db.execute({
      sql: `
        SELECT 
          q.text AS question,
          ROUND(AVG(r.value), 2) AS avg_score,
          COUNT(r.id) AS total_votes
        FROM reactions r
        JOIN questions q ON q.id = r.question_id
        WHERE ${filter.condition.replace(/r\.created_at/g, 'r.created_at')}
        ${EXCLUDE_TEST}
        GROUP BY r.question_id
        HAVING COUNT(r.id) >= ${MIN_VOTES}
        ORDER BY avg_score ASC, total_votes DESC
        LIMIT 1;
      `,
      args: filter.args
    });

    res.status(200).json({ worstQuestionWeek: result.rows[0] || null });
  } catch (error) {
    console.error("Error en getWorstQuestionWeek:", error);
    throw new InternalServerError("Error obteniendo peor pregunta");
  }
};

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
        WHERE ${filter.condition.replace(/r\.created_at/g, 'r.created_at')}
        ${EXCLUDE_TEST}
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
        WHERE ${filter.condition.replace(/r\.created_at/g, 'r.created_at')}
          AND r.shift IS NOT NULL
          ${EXCLUDE_TEST}
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