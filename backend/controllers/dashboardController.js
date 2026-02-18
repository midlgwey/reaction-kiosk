import { db } from '../db.js';
import { InternalServerError } from '../errors/customErrors.js';

// Tijuana Invierno: '-8 hours' | Tijuana Verano: '-7 hours' (Ajustar según temporada)
const TIME_OFFSET = '-8 hours'; 

//helper
const getTimeModifier = (req) => {

  // Si no se pide nada, usamos 7 por defecto.
  const dias = parseInt(req.query.days) || 7;
  return `-${dias - 1} days`;
};

/* ----------------------------
   TOTAL REACCIONES DEL DÍA 
 */
export const getDailyReactions = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT COUNT(*) AS total
        FROM reactions
        WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}');
      `,
    });

    res.status(200).json({
      totalReactionsToday: result.rows[0].total || 0
    });

  } catch (error) {
    throw new InternalServerError("Error obteniendo reacciones");
  }
};


/* --------------------------
   SERVICIO MESERO DEL DÍA
*/
export const getDailyServerScore = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          COALESCE(ROUND(AVG(value),2), 0) AS avg_score, -- COALESCE evita valores null
          COUNT(id) AS total_votes
        FROM reactions
        WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
        AND question_id = 1;
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


/* --------------------
   FELICIDAD DEL DÍA
*/
export const getTodayHappinessIndex = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          COALESCE(ROUND(AVG(value),2), 0) AS avg_score,
          COUNT(*) as total
        FROM reactions
        WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}');
      `,
    });

    const avg = result.rows[0].avg_score;
    const total = result.rows[0].total;

    // Cálculo del porcentaje basado en el máximo de 4 estrellas
    const percent = total > 0 ? Math.round((avg / 4) * 100) : 0;

    res.status(200).json({
      happinessPercent: percent,
      avgScore: avg,
      totalResponses: total
    });
  } catch (error) {
    throw new InternalServerError("Error índice felicidad");
  }
};


/* ----------------------------
   FELICIDAD POR TURNO DEL DÍA
   */
export const getTodayHappinessByShift = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          shift,
          ROUND(AVG(value),2) AS avg_score
        FROM reactions
        WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
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


/* ---------------------
   AREA CHART SEMANA REAL 
*/
export const getDailySatisfactionTrend = async (req, res) => {
  try {

    //Calculamos el inicio del rango (semana o mensual)
    const timeModifier = getTimeModifier(req);

    const result = await db.execute({
      sql: `
      WITH RECURSIVE days(day) AS (
      -- Usamos el parámetro dinámico para saber dónde empezar
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
      GROUP BY days.day
      ORDER BY days.day ASC;
      `,
      args: [timeModifier]
    });

    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error en getDailySatisfactionTrend:", error);
    throw new InternalServerError("Error evolución semanal");
  }
};


/*-------------
   DONA SEMANAL 
 */
export const getWeeklySentimentSummary = async (req, res) => {
  try {

    //Calculamos el inicio del rango (semana o mensual)
    const timeModifier = getTimeModifier(req);

    const result = await db.execute({
      sql: `
        SELECT
          COALESCE(SUM(CASE WHEN value = 4 THEN 1 ELSE 0 END),0) AS excelente,
          COALESCE(SUM(CASE WHEN value = 3 THEN 1 ELSE 0 END),0) AS bueno,
          COALESCE(SUM(CASE WHEN value = 2 THEN 1 ELSE 0 END),0) AS puede_mejorar,
          COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END),0) AS malo,
          COUNT(*) as total
        FROM reactions

        WHERE DATE(created_at, '${TIME_OFFSET}') 
              >= DATE('now', '${TIME_OFFSET}', ?);
      `,
      args: [timeModifier]
    });

    res.status(200).json(result.rows[0] || {
      excelente: 0,
      bueno: 0,
      puede_mejorar: 0,
      malo: 0,
      total: 0
    });

 } catch (error) {
    console.error("Error en getWeeklySentimentSummary:", error);
    throw new InternalServerError("Error obteniendo el resumen semanal");
  }
};