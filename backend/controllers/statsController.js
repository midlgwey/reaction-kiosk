import { db } from '../db.js';
import { NotFoundError, InternalServerError } from '../errors/customErrors.js';

/* ======================================================
   MEJOR PREGUNTA SEMANA
====================================================== */
export const getBestQuestionWeek = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          q.text AS question,
          ROUND(AVG(r.value), 2) AS avg_score,
          COUNT(r.id) AS total_votes
        FROM reactions r
        JOIN questions q ON q.id = r.question_id
        WHERE r.created_at >= datetime('now','-8 hours','-7 days')
        GROUP BY r.question_id
        HAVING total_votes > 0
        ORDER BY avg_score DESC
        LIMIT 1;
      `,
    });

    if (result.rows.length === 0) {
      throw new NotFoundError("No hay estadísticas esta semana");
    }

    res.status(200).json({ bestQuestionWeek: result.rows[0] });

  } catch (error) {
    if (error.statusCode) throw error;
    throw new InternalServerError("Error obteniendo mejor pregunta");
  }
};


/* ======================================================
   PEOR PREGUNTA SEMANA
====================================================== */
export const getWorstQuestionWeek = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          q.text AS question,
          ROUND(AVG(r.value), 2) AS avg_score,
          COUNT(r.id) AS total_votes
        FROM reactions r
        JOIN questions q ON q.id = r.question_id
        WHERE r.created_at >= datetime('now','-8 hours','-7 days')
        GROUP BY r.question_id
        HAVING total_votes > 0
        ORDER BY avg_score ASC
        LIMIT 1;
      `,
    });

    if (result.rows.length === 0) {
      throw new NotFoundError("No hay estadísticas esta semana");
    }

    res.status(200).json({ worstQuestionWeek: result.rows[0] });

  } catch (error) {
    if (error.statusCode) throw error;
    throw new InternalServerError("Error obteniendo peor pregunta");
  }
};


/*======================================================
   BARRAS POR PREGUNTA (SEMANA)
====================================================== */
export const getWeeklySurveyChart = async (req, res) => {
  try {
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

        WHERE DATE(r.created_at,'-7 hours') >= DATE('now','-7 hours','-6 days')

        GROUP BY q.id
        ORDER BY q.id;
      `,
    });

    res.status(200).json(result.rows);

  } catch {
    throw new InternalServerError("Error gráfico por pregunta semanal");
  }
};


/* ======================================================
   RADAR SEMANA ACTUAL VS PASADA
====================================================== */
export const getWeeklyComparisonRadar = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT
          q.text as question,

          ROUND(AVG(CASE 
            WHEN r.created_at >= datetime('now','-8 hours','-7 days')
            THEN r.value END
          ) * 25, 1) as current_week_score,

          ROUND(AVG(CASE 
            WHEN r.created_at < datetime('now','-8 hours','-7 days')
            AND r.created_at >= datetime('now','-8 hours','-14 days')
            THEN r.value END
          ) * 25, 1) as last_week_score

        FROM questions q
        LEFT JOIN reactions r ON r.question_id = q.id
        GROUP BY q.id
        ORDER BY q.id;
      `,
    });

    res.status(200).json(result.rows);

  } catch (error) {
    throw new InternalServerError("Error radar semanal");
  }
};

/* ======================================================
   SATISFACCIÓN POR TURNO Y DÍA (SEMANA REAL)
====================================================== */
export const getOverallDistributionWeek = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          DATE(r.created_at,'-7 hours') as day,
          r.shift,
          r.value,
          COUNT(*) as total

        FROM reactions r

        WHERE DATE(r.created_at,'-7 hours') >= DATE('now','-7 hours','-6 days')
          AND r.shift IS NOT NULL

        GROUP BY day, r.shift, r.value
        ORDER BY day ASC;
      `,
    });

    res.status(200).json(result.rows);

  } catch {
    throw new InternalServerError("Error distribución turnos semanal");
  }
};



/* ======================================================
   MEJOR DÍA SEMANA
====================================================== */
export const getWeeklyDayStrong = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
      WITH days AS (
        SELECT DATE(created_at,'-7 hours') as day,
               ROUND(AVG(value),2) as avg_score,
               COUNT(*) as total_responses
        FROM reactions
        WHERE DATE(created_at,'-7 hours') >= DATE('now','-7 hours','-6 days')
        GROUP BY day
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
        ROUND((avg_score/4)*100,0) as satisfaction_percent,
        total_responses,
        (SELECT COUNT(*) FROM days) as total_days
      FROM days
      ORDER BY avg_score DESC
      LIMIT 1;
      `,
    });

    res.status(200).json(result.rows[0] || {});
  } catch {
    throw new InternalServerError("Error obteniendo día fuerte");
  }
};

/* ======================================================
   PEOR DÍA SEMANA
====================================================== */
export const getWeeklyDayWeak = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
      WITH days AS (
        SELECT DATE(created_at,'-7 hours') as day,
               ROUND(AVG(value),2) as avg_score,
               COUNT(*) as total_responses
        FROM reactions
        WHERE DATE(created_at,'-7 hours') >= DATE('now','-7 hours','-6 days')
        GROUP BY day
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
        ROUND((avg_score/4)*100,0) as satisfaction_percent,
        total_responses,
        (SELECT COUNT(*) FROM days) as total_days
      FROM days
      ORDER BY avg_score ASC
      LIMIT 1;
      `,
    });

    res.status(200).json(result.rows[0] || {});
  } catch {
    throw new InternalServerError("Error obteniendo día débil");
  }
};
