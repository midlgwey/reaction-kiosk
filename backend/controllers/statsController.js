import { db } from '../db.js';
import { NotFoundError, InternalServerError } from '../errors/customErrors.js';

// Ajuste de hora para Tijuana (Invierno: -8, Verano: -7)
// Cambiar esto cuando cambie el horario
const TIME_OFFSET = '-8 hours'; 

//Helper 
const getTimeModifier = (req) => {
  // Si en la URL mandan ?days=30 usamos eso, si no, nos vamos por la libre con 7 (semana)
  const dias = parseInt(req.query.days) || 7;
  
  // A la base de datos se le resta uno menos. 
  return `-${dias - 1} days`;
};

/* ======================================================
   MEJOR PREGUNTA SEMANA (Umbral de 5 votos)
====================================================== */
export const getBestQuestionWeek = async (req, res) => {
  try {
    const timeModifier = getTimeModifier(req);
    const MIN_VOTES = 5;

    const result = await db.execute({
      sql: `
        SELECT 
          q.text AS question,
          ROUND(AVG(r.value), 2) AS avg_score,
          COUNT(r.id) AS total_votes
        FROM reactions r
        JOIN questions q ON q.id = r.question_id
        WHERE DATE(r.created_at, '${TIME_OFFSET}') >= DATE('now', '${TIME_OFFSET}', ?)
        GROUP BY r.question_id
        -- Solo preguntas con representatividad estadística
        HAVING COUNT(r.id) >= ${MIN_VOTES}
        ORDER BY avg_score DESC, total_votes DESC
        LIMIT 1;
      `,
      args: [timeModifier]
    });

    res.status(200).json({ bestQuestionWeek: result.rows[0] || null });
  } catch (error) {
    console.error("Error en getBestQuestionWeek:", error);
    throw new InternalServerError("Error obteniendo mejor pregunta");
  }
};

/* ======================================================
   PEOR PREGUNTA SEMANA (Umbral de 5 votos)
====================================================== */
export const getWorstQuestionWeek = async (req, res) => {
  try {
    const timeModifier = getTimeModifier(req);
    const MIN_VOTES = 5;

    const result = await db.execute({
      sql: `
        SELECT 
          q.text AS question,
          ROUND(AVG(r.value), 2) AS avg_score,
          COUNT(r.id) AS total_votes
        FROM reactions r
        JOIN questions q ON q.id = r.question_id
        WHERE DATE(r.created_at, '${TIME_OFFSET}') >= DATE('now', '${TIME_OFFSET}', ?)
        GROUP BY r.question_id
        HAVING COUNT(r.id) >= ${MIN_VOTES}
        ORDER BY avg_score ASC, total_votes DESC
        LIMIT 1;
      `,
      args: [timeModifier]
    });

    res.status(200).json({ worstQuestionWeek: result.rows[0] || null });
  } catch (error) {
    console.error("Error en getWorstQuestionWeek:", error);
    throw new InternalServerError("Error obteniendo peor pregunta");
  }
};

/*======================================================
   BARRAS POR PREGUNTA (SEMANA)
====================================================== */
export const getWeeklySurveyChart = async (req, res) => {
  try {

    const timeModifier = getTimeModifier(req);

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

        WHERE DATE(r.created_at,'${TIME_OFFSET}') >= DATE('now','${TIME_OFFSET}', ?)
        GROUP BY q.id
        ORDER BY q.id;
      `,
      args: [timeModifier]
    });

    res.status(200).json(result.rows);

  } catch {
    console.error("Error al armar la gráfica de barras:", error);
    throw new InternalServerError("Error gráfico por pregunta semanal");
  }
};


/* ======================================================
   RADAR SEMANA ACTUAL VS PASADA
   (Compara los últimos 7 días vs los 7 anteriores)
====================================================== */
export const getWeeklyComparisonRadar = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT
          q.text as question,
          -- COALESCE asegura que si no hay votos, el radar marque 0 y no se rompa
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

    const timeModifier = getTimeModifier(req); 

    const result = await db.execute({
      sql: `
        SELECT 
          DATE(r.created_at,'${TIME_OFFSET}') as day,
          r.shift,
          r.value,
          COUNT(*) as total
        FROM reactions r
        WHERE DATE(r.created_at,'${TIME_OFFSET}') >= DATE('now','${TIME_OFFSET}', ?)
          AND r.shift IS NOT NULL
        GROUP BY day, r.shift, r.value
        ORDER BY day ASC;
      `,
      args: [timeModifier]
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
    const timeModifier = getTimeModifier(req);
    const MIN_RESPONSES = 5; // Umbral de relevancia estadística

    const result = await db.execute({
      sql: `
      WITH days AS (
        SELECT 
          DATE(created_at, '${TIME_OFFSET}') as day,
          COALESCE(AVG(value), 0) as avg_score,
          COUNT(*) as total_responses
        FROM reactions
        WHERE DATE(created_at, '${TIME_OFFSET}') >= DATE('now', '${TIME_OFFSET}', ?)
        GROUP BY day
        -- Filtro para asegurar que el promedio sea estadísticamente significativo
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
      args: [timeModifier]
    });

    // Retorna null si ningún día cumple con el mínimo de respuestas
    res.status(200).json(result.rows[0] || null);
  } catch (error) {
    console.error("Error en getWeeklyDayStrong:", error);
    throw new InternalServerError("Error obteniendo día fuerte");
  }
};

/* ======================================================
   PEOR DÍA SEMANA
====================================================== */
export const getWeeklyDayWeak = async (req, res) => {
  try {
    const timeModifier = getTimeModifier(req);
    const MIN_RESPONSES = 5; 

    const result = await db.execute({
      sql: `
      WITH days AS (
        SELECT 
          DATE(created_at, '${TIME_OFFSET}') as day,
          COALESCE(AVG(value), 0) as avg_score,
          COUNT(*) as total_responses
        FROM reactions
        WHERE DATE(created_at, '${TIME_OFFSET}') >= DATE('now', '${TIME_OFFSET}', ?)
        GROUP BY day
        -- Excluye días con datos insuficientes para evitar sesgos por muestras pequeñas
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
      args: [timeModifier]
    });

    res.status(200).json(result.rows[0] || null);
  } catch (error) {
    console.error("Error en getWeeklyDayWeak:", error);
    throw new InternalServerError("Error obteniendo día débil");
  }
};