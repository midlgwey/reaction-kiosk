import { db } from '../db.js';
import { StatusCodes } from 'http-status-codes';
import { InternalServerError, BadRequestError  } from '../errors/customErrors.js';

// Ajuste de hora para Tijuana (UTC-7)
const TIME_OFFSET = '-7 hours'; 

/**
 * Obtiene el ranking de meseros basado en un sistema de puntuación acumulada.
 * Premia la cantidad de interacciones positivas sobre promedios de muestras pequeñas.
 */
export const getWaitersTableRanking = async (req, res) => {
    const { date, shift } = req.query;

    // Validación de formato de fecha o uso de la fecha actual
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const safeDate = date && dateRegex.test(date) ? date : new Date().toISOString().split('T')[0];

    try {
        let sql = `
            SELECT 
                w.name AS waiter_name,
                AVG(r.promedio_encuesta) AS average_rating,
                COUNT(r.survey_id) AS total_interactions,
                SUM(r.puntos_encuesta) AS score_total,
                GROUP_CONCAT(r.table_number) AS tables_list,
                COUNT(d.id) AS total_declines
            FROM waiters w
            JOIN (
                /* Consolidación de respuestas y cálculo de puntos por encuesta */
                SELECT 
                    waiter_id, 
                    survey_id, 
                    table_number, 
                    AVG(value) as promedio_encuesta, 
                    SUM(
                        CASE 
                            WHEN value = 4 THEN 4   /* Excelente: +4 puntos */
                            WHEN value = 3 THEN 2   /* Bueno: +2 puntos */
                            WHEN value = 2 THEN 0   /* Regular: 0 puntos */
                            WHEN value = 1 THEN -5  /* Malo: -5 puntos */
                            ELSE 0
                        END
                    ) as puntos_encuesta,
                    created_at, 
                    shift
                FROM reactions
                GROUP BY survey_id
            ) r ON w.id = r.waiter_id
            LEFT JOIN declines d ON w.id = d.waiter_id  
        AND date(datetime(d.created_at, ?)) = date(?)  
            WHERE date(datetime(r.created_at, ?)) = date(?)
        `;

        const args = [TIME_OFFSET, safeDate, TIME_OFFSET, safeDate];

        // Filtro por turno
        if (shift && shift !== 'Todos') {
            sql += ` AND r.shift = ? `;
            args.push(shift);
        }

        sql += `
            GROUP BY w.id, w.name
            ORDER BY score_total DESC
        `;

        const result = await db.execute({ sql, args });

        // Mapeo de resultados para el cliente
        const rankingTable = result.rows.map((row, index) => ({
            rank: index + 1,
            mesero: row.waiter_name || "Sin nombre", 
            promedio: row.average_rating ? Number(row.average_rating).toFixed(1) : "0.0",
            puntuacion: row.score_total || 0,
            interacciones: row.total_interactions || 0,
            rechazos: row.total_declines || 0 ,
            detalle_mesas: row.tables_list || "" 
        }));

        res.status(StatusCodes.OK).json(rankingTable);

    } catch (error) {
        console.error("Error al generar tabla de ranking:", error);
        throw new InternalServerError("Error al obtener los datos del ranking");
    }
};

/**
 * Obtiene la lista completa de meseros para el selector del frontend.
 */
export const getAllWaiters = async (req, res) => {
    const { date } = req.query;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const safeDate = date && dateRegex.test(date) ? date : new Date().toISOString().split('T')[0];

    try {
        const result = await db.execute({
            sql: `
                SELECT DISTINCT w.id, w.name
                FROM waiters w
                INNER JOIN reactions r ON w.id = r.waiter_id
                WHERE date(datetime(r.created_at, ?)) = date(?)
                ORDER BY w.name ASC
            `,
            args: [TIME_OFFSET, safeDate]
        });

        const waiters = result.rows.map(row => ({
            id: row.id,
            mesero: row.name
        }));

        res.status(StatusCodes.OK).json(waiters);
    } catch (error) {
        console.error("Error al obtener lista de meseros:", error);
        throw new InternalServerError("Error al obtener la lista de meseros");
    }
};
/**
 * Obtiene el detalle de respuestas por pregunta para un mesero específico.
 */
export const getWaiterRadiography = async (req, res) => {

    const { waiterId, date, shift, tableNumber } = req.query;

    if (!waiterId) {
        throw new BadRequestError('El ID del mesero es requerido');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const safeDate = date && dateRegex.test(date) ? date : new Date().toISOString().split('T')[0];

    const QUESTION_LABELS = {
        1: '¿Qué le pareció el servicio de su mesero?',
        2: '¿Las bebidas llegaron en el tiempo esperado?',
        3: '¿Los alimentos servidos cumplieron sus expectativas?',
        4: '¿Nuestras instalaciones estuvieron a la altura de su visita?'
    };

    try {
        let sql = `
            SELECT 
                question_id,
                SUM(CASE WHEN value = 4 THEN 1 ELSE 0 END) as excelente,
                SUM(CASE WHEN value = 3 THEN 1 ELSE 0 END) as bueno,
                SUM(CASE WHEN value = 2 THEN 1 ELSE 0 END) as regular,
                SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) as malo,
                COUNT(*) as total_pregunta
            FROM reactions
            WHERE waiter_id = ? 
              AND date(datetime(created_at, ?)) = date(?)
        `;

        const args = [waiterId, TIME_OFFSET, safeDate];

        if (shift && shift !== 'Todos') {
            sql += ` AND shift = ? `;
            args.push(shift);
        }

        if (tableNumber) {
            sql += ` AND table_number = ? `;
            args.push(tableNumber);
        }

        sql += ` GROUP BY question_id ORDER BY question_id ASC `;

        const result = await db.execute({ sql, args });

        // Si no hay datos, inicializar estructura vacía para las 4 preguntas
        if (result.rows.length === 0) {
            const emptyData = [1, 2, 3, 4].map(id => ({
                id,
                label: QUESTION_LABELS[id],
                total: 0,
                respuestas: { excelente: 0, bueno: 0, regular: 0, malo: 0 }
            }));
            return res.status(StatusCodes.OK).json(emptyData);
        }

        const radiography = result.rows.map(row => ({
            id: row.question_id,
            label: QUESTION_LABELS[row.question_id] || `Pregunta ${row.question_id}`,
            total: row.total_pregunta,
            respuestas: {
                excelente: row.excelente || 0,
                bueno: row.bueno || 0,
                regular: row.regular || 0,
                malo: row.malo || 0
            }
        }));

        res.status(StatusCodes.OK).json(radiography);

    } catch (error) {
        console.error('Error al obtener radiografía del mesero:', error);
        throw new InternalServerError('Error al obtener los detalles del desempeño');
    }
};

export const getWaiterTables = async (req, res) => {
  const { waiterId, date } = req.query;

  if (!waiterId) throw new BadRequestError('El ID del mesero es requerido');

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const safeDate = date && dateRegex.test(date) ? date : new Date().toISOString().split('T')[0];

  try {
    const result = await db.execute({
      sql: `
        SELECT DISTINCT table_number
        FROM reactions
        WHERE waiter_id = ?
          AND date(datetime(created_at, ?)) = date(?)
        ORDER BY table_number ASC
      `,
      args: [waiterId, TIME_OFFSET, safeDate]
    });

    res.status(StatusCodes.OK).json(result.rows.map(r => r.table_number));
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    throw new InternalServerError('Error al obtener las mesas');
  }
};