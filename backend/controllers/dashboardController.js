import { db } from '../db.js';
import { InternalServerError } from '../errors/customErrors.js';

/* ======================================================
   TOTAL REACCIONES DEL DÍA (TIJUANA)
====================================================== */
export const getDailyReactions = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) AS total
        FROM reactions
        WHERE DATE(created_at, '-7 hours') = DATE('now', '-7 hours');
      `,
    });

    res.status(200).json({
      totalReactionsToday: result.rows[0].total || 0
    });

  } catch (error) {
    throw new InternalServerError("Error obteniendo reacciones");
  }
};


/* ======================================================
   SERVICIO MESERO DEL DÍA
====================================================== */
export const getDailyServerScore = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          ROUND(AVG(value),2) AS avg_score,
          COUNT(id) AS total_votes
        FROM reactions
        WHERE DATE(created_at, '-7 hours') = DATE('now', '-7 hours')
        AND question_id = 1;
      `,
    });

    res.status(200).json({
      avgScore: result.rows[0].avg_score || 0,
      totalResponses: result.rows[0].total_votes || 0
    });

  } catch (error) {
    throw new InternalServerError("Error servicio mesero");
  }
};


/* ======================================================
   FELICIDAD DEL DÍA
====================================================== */
export const getTodayHappinessIndex = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          ROUND(AVG(value),2) AS avg_score,
          COUNT(*) as total
        FROM reactions
        WHERE DATE(created_at, '-7 hours') = DATE('now', '-7 hours');
      `,
    });

    const avg = result.rows[0].avg_score || 0;
    const total = result.rows[0].total || 0;

    if (!total) {
      return res.status(200).json({
        happinessPercent: 0,
        avgScore: 0,
        totalResponses: 0
      });
    }

    const percent = Math.round((avg / 4) * 100);

    res.status(200).json({
      happinessPercent: percent,
      avgScore: avg,
      totalResponses: total
    });

  } catch (error) {
    throw new InternalServerError("Error índice felicidad");
  }
};


/* ======================================================
   FELICIDAD POR TURNO DEL DÍA
====================================================== */
export const getTodayHappinessByShift = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          shift,
          ROUND(AVG(value),2) AS avg_score
        FROM reactions
        WHERE DATE(created_at, '-7 hours') = DATE('now', '-7 hours')
        GROUP BY shift;
      `,
    });

    const formatted = {
      desayuno: 0,
      comidaCena: 0
    };

    result.rows.forEach(row => {
      const percent = Math.round((row.avg_score / 4) * 100);

      if (row.shift === "Desayuno") formatted.desayuno = percent;
      if (row.shift === "Comida/Cena") formatted.comidaCena = percent;
    });

    res.status(200).json(formatted);

  } catch (error) {
    throw new InternalServerError("Error por turno");
  }
};


/* ======================================================
   AREA CHART SEMANA REAL (TIJUANA)
====================================================== */
export const getDailySatisfactionTrend = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
      WITH RECURSIVE days(day) AS (
        SELECT DATE(datetime('now','-8 hours','-6 days'))
        UNION ALL
        SELECT DATE(day,'+1 day')
        FROM days
        WHERE day < DATE(datetime('now','-8 hours'))
      )

      SELECT 
        days.day,
        COALESCE(ROUND(AVG(r.value),2),0) as avg_satisfaction,
        COUNT(r.id) as total_responses
      FROM days
      LEFT JOIN reactions r 
        ON DATE(datetime(r.created_at,'-8 hours')) = days.day
      GROUP BY days.day
      ORDER BY days.day ASC;
      `,
    });

    res.status(200).json(result.rows);

  } catch (error) {
    throw new InternalServerError("Error evolución semanal");
  }
};


/* ======================================================
   DONA SEMANAL 
====================================================== */
export const getWeeklySentimentSummary = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT
          COALESCE(SUM(CASE WHEN value = 4 THEN 1 ELSE 0 END),0) AS excelente,
          COALESCE(SUM(CASE WHEN value = 3 THEN 1 ELSE 0 END),0) AS bueno,
          COALESCE(SUM(CASE WHEN value = 2 THEN 1 ELSE 0 END),0) AS puede_mejorar,
          COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END),0) AS malo,
          COUNT(*) as total
        FROM reactions
        WHERE DATE(datetime(created_at,'-8 hours'))
        >= DATE(datetime('now','-8 hours','-6 days'));
      `,
    });

    res.status(200).json(result.rows[0] || {
      excelente: 0,
      bueno: 0,
      puede_mejorar: 0,
      malo: 0,
      total: 0
    });

  } catch (error) {
    throw new InternalServerError("Error dona semanal");
  }
};
