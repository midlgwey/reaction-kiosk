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
   MESEROS CON MENOR INTERACCIÓN (QUE LLEVA POCAS ENCUESTAS EN DESAYUNO Y COMIDA/CENA DEL DIA)

*/
export const getLowInteractionWaiters = async (req, res) => {
  try {
    const [breakfastResult, lunchResult] = await Promise.all([
      db.execute({
        sql: `
          SELECT
            w.name AS mesero,
            'Desayuno' AS turno,
            COUNT(DISTINCT r.survey_id) AS encuestas
          FROM waiters w
          LEFT JOIN reactions r ON w.id = r.waiter_id
            AND DATE(r.created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
            AND r.shift = 'Desayuno'
          WHERE w.active = 1
          GROUP BY w.id, w.name
          HAVING encuestas >= 2        
          ORDER BY encuestas ASC
          LIMIT 1
        `
      }),
      db.execute({
        sql: `
          SELECT
            w.name AS mesero,
            'Comida/Cena' AS turno,
            COUNT(DISTINCT r.survey_id) AS encuestas
          FROM waiters w
          LEFT JOIN reactions r ON w.id = r.waiter_id
            AND DATE(r.created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
            AND r.shift = 'Comida/Cena'
          WHERE w.active = 1
          GROUP BY w.id, w.name
          HAVING encuestas >= 1        
          ORDER BY encuestas ASC
          LIMIT 1
        `
      })
    ]);

    const result = [
      ...(breakfastResult.rows[0] ? [breakfastResult.rows[0]] : []),
      ...(lunchResult.rows[0] ? [lunchResult.rows[0]] : [])
    ];

    res.status(200).json(result.map(row => ({
      mesero: row.mesero,
      turno: row.turno,
      encuestas: row.encuestas || 0
    })));

  } catch (error) {
    throw new InternalServerError("Error meseros con poca interacción");
  }
};

/* ----------------------------
   TOTAL ENCUESTAS REALIZADAS Y NO REALIZADAS POR DIA
*/
export const getDailySurveyCount = async (req, res) => {
  try {
    const [surveysResult, declinesResult] = await Promise.all([
      // Encuestas realizadas — conta por survey_id único
      db.execute({
        sql: `
          SELECT COUNT(DISTINCT survey_id) AS total
          FROM reactions
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
        `
      }),
      // Encuestas rechazadas
      db.execute({
        sql: `
          SELECT COUNT(*) AS total
          FROM declines
          WHERE DATE(created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
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

/* ---------------------
   AREA CHART SEMANA REAL 
*/
export const getDailySatisfactionTrend = async (req, res) => {
  try {
    const filter = getDateFilters(req);
    let sql, args;

    // Si hay un rango de fechas explícito
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
      GROUP BY days.day
      ORDER BY days.day ASC;
      `;
      // Es vital suministrar los argumentos a la CTE para el inicio y fin recursivo
      args = [filter.args[0], filter.args[1]]; 
    } else {
      // Comportamiento original (últimos X días)
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
      GROUP BY days.day
      ORDER BY days.day ASC;
      `;
      args = filter.args; // [timeModifier]
    }

    const result = await db.execute({ sql, args });
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error en getDailySatisfactionTrend:", error);
    throw new InternalServerError("Error evolución temporal");
  }
};


/* --------------------------------------------------
   RADIOGRAFÍA POR PREGUNTA (BARRAS APILADAS)
-------------------------------------------------- */
export const getDailyQuestions = async (req, res) => {
  try {
    // Usamos tu helper para saber qué rango de fechas pidió el cliente
    const filter = getDateFilters(req);
    
    // Arreglamos el alias por si el helper regresa 'r.created_at' en lugar de 'created_at'
    let conditionFixed = filter.condition;
    if(conditionFixed.includes('r.created_at')) {
        conditionFixed = conditionFixed.replace(/r\.created_at/g, 'created_at');
    }

    // La consulta mágica que cuenta cada tipo de respuesta separada por pregunta
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
        GROUP BY question_id
        ORDER BY question_id ASC;
      `,
      args: filter.args
    });

    // Mapeo de nombres de preguntas según su ID para mandarlo bonito al frontend
    const QUESTION_LABELS = {
      1: '¿Qué le pareció el servicio de su mesero?',
      2: '¿Las bebidas llegaron en el tiempo esperado?',
      3: '¿Los alimentos servidos cumplieron sus expectativas?',
      4: '¿Nuestras instalaciones estuvieron a la altura de su visita?'
    };

    // Formateamos la respuesta para que el Frontend la consuma facilísimo
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