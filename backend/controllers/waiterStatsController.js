import { db } from '../db.js';
import { StatusCodes } from 'http-status-codes';
import { InternalServerError, BadRequestError } from '../errors/customErrors.js';
import { TIME_OFFSET, EXCLUDE_TEST, EXCLUDE_TEST_W, safeDate, getMonthRange } from '../utils/queryHelpers.js';

/**
 * Ranking de meseros por puntuación acumulada.
 * Sistema: Excelente +4, Bueno +2, Regular 0, Malo -5.
 * Premia volumen de interacciones positivas sobre promedios de muestras pequeñas.
 */
export const getWaitersTableRanking = async (req, res) => {
    const { date, shift } = req.query;
    const fechaSegura = safeDate(date);

    try {
        let sql = `
            SELECT 
                w.name AS waiter_name,
                AVG(r.promedio_encuesta) AS average_rating,
                COUNT(r.survey_id) AS total_interactions,
                SUM(r.puntos_encuesta) AS score_total,
                GROUP_CONCAT(r.table_number) AS tables_list,
                COALESCE((
                    SELECT COUNT(*) 
                    FROM declines d 
                    WHERE d.waiter_id = w.id 
                    AND date(datetime(d.created_at, ?)) = date(?)
                ), 0) AS total_declines
            FROM waiters w
            JOIN (
                SELECT 
                    waiter_id, 
                    survey_id, 
                    table_number, 
                    AVG(value) as promedio_encuesta, 
                    SUM(
                        CASE 
                            WHEN value = 4 THEN 4
                            WHEN value = 3 THEN 2
                            WHEN value = 2 THEN 0
                            WHEN value = 1 THEN -5
                            ELSE 0
                        END
                    ) as puntos_encuesta,
                    created_at, 
                    shift
                FROM reactions
                WHERE waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
                GROUP BY survey_id
            ) r ON w.id = r.waiter_id
            WHERE date(datetime(r.created_at, ?)) = date(?)
            ${EXCLUDE_TEST_W}
        `;

        const args = [TIME_OFFSET, fechaSegura, TIME_OFFSET, fechaSegura];

        if (shift && shift !== 'Todos') {
            sql += ` AND r.shift = ? `;
            args.push(shift);
        }

        sql += ` GROUP BY w.id, w.name ORDER BY score_total DESC `;

        const result = await db.execute({ sql, args });

        const rankingTable = result.rows.map((row, index) => ({
            rank: index + 1,
            mesero: row.waiter_name || "Sin nombre",
            promedio: row.average_rating ? Number(row.average_rating).toFixed(1) : "0.0",
            puntuacion: row.score_total || 0,
            interacciones: row.total_interactions || 0,
            rechazos: row.total_declines || 0,
            detalle_mesas: row.tables_list || ""
        }));

        res.status(StatusCodes.OK).json(rankingTable);

    } catch (error) {
        console.error("Error al generar tabla de ranking:", error);
        throw new InternalServerError("Error al obtener los datos del ranking");
    }
};

/**
 * Lista de meseros que tuvieron encuestas en la fecha indicada.
 * Se usa para poblar el selector del panel de meseros.
 */
export const getAllWaiters = async (req, res) => {
    const { date } = req.query;
    const fechaSegura = safeDate(date);

    try {
        const result = await db.execute({
            sql: `
                SELECT DISTINCT w.id, w.name
                FROM waiters w
                INNER JOIN reactions r ON w.id = r.waiter_id
                WHERE date(datetime(r.created_at, ?)) = date(?)
                AND w.is_test = 0
                ORDER BY w.name ASC
            `,
            args: [TIME_OFFSET, fechaSegura]
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
 * Detalle de respuestas por pregunta para un mesero específico.
 * Soporta filtros por turno y número de mesa.
 * Si no hay datos, regresa estructura vacía para las 4 preguntas.
 */
export const getWaiterRadiography = async (req, res) => {
    const { waiterId, date, shift, tableNumber } = req.query;

    if (!waiterId) {
        throw new BadRequestError('El ID del mesero es requerido');
    }

    const fechaSegura = safeDate(date);

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
              AND waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
        `;

        const args = [waiterId, TIME_OFFSET, fechaSegura];

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

        // Sin datos — regresa estructura vacía para las 4 preguntas
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

// Mesas atendidas por un mesero en la fecha indicada
export const getWaiterTables = async (req, res) => {
    const { waiterId, date } = req.query;

    if (!waiterId) throw new BadRequestError('El ID del mesero es requerido');

    const fechaSegura = safeDate(date);

    try {
        const result = await db.execute({
            sql: `
                SELECT DISTINCT table_number
                FROM reactions
                WHERE waiter_id = ?
                  AND date(datetime(created_at, ?)) = date(?)
                  AND waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
                ORDER BY table_number ASC
            `,
            args: [waiterId, TIME_OFFSET, fechaSegura]
        });

        res.status(StatusCodes.OK).json(result.rows.map(r => r.table_number));
    } catch (error) {
        console.error('Error al obtener mesas:', error);
        throw new InternalServerError('Error al obtener las mesas');
    }
};

// Rechazos de encuesta del día, filtrable por turno
export const getWaiterDeclines = async (req, res) => {
    const { date, shift } = req.query;
    const fechaSegura = safeDate(date);

    try {
        let sql = `
            SELECT
                d.id,
                w.name AS mesero,
                d.table_number AS mesa,
                datetime(d.created_at, ?) AS hora      
            FROM declines d
            LEFT JOIN waiters w ON d.waiter_id = w.id
            WHERE date(datetime(d.created_at, ?)) = date(?)
            AND d.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
        `;

        const args = [TIME_OFFSET, TIME_OFFSET, fechaSegura];

        if (shift && shift !== 'Todos') {
            sql += ` AND LOWER(d.shift) = LOWER(?) `;
            args.push(shift);
        }

        sql += ` ORDER BY d.created_at DESC `;

        const result = await db.execute({ sql, args });
        const declines = result.rows.map(row => ({
            id: row.id,
            mesero: row.mesero || "Sin nombre",
            mesa: row.mesa || "Desconocida",
            hora: row.hora ? new Date(row.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Hora desconocida"
        }));
        res.status(StatusCodes.OK).json(declines);
    } catch (error) {
        console.error("Error al obtener rechazos:", error);
        throw new InternalServerError("Error al obtener los rechazos");
    }
};

// Bitácora de encuestas realizadas — agrupa por survey_id e incluye las 4 respuestas
export const getSurveysLog = async (req, res) => {
    const { date } = req.query;
    const fechaSegura = safeDate(date);

    try {
        const result = await db.execute({
            sql: `
                SELECT
                    r.survey_id,
                    w.name AS mesero,
                    r.table_number AS mesa,
                    r.shift AS turno,
                    datetime(MIN(r.created_at), ?) AS hora,
                    MAX(CASE WHEN r.question_id = 1 THEN r.value END) AS q1,
                    MAX(CASE WHEN r.question_id = 2 THEN r.value END) AS q2,
                    MAX(CASE WHEN r.question_id = 3 THEN r.value END) AS q3,
                    MAX(CASE WHEN r.question_id = 4 THEN r.value END) AS q4
                FROM reactions r
                LEFT JOIN waiters w ON r.waiter_id = w.id
                WHERE date(datetime(r.created_at, ?)) = date(?)
                AND r.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
                GROUP BY r.survey_id
                ORDER BY MIN(r.created_at) ASC
            `,
            args: [TIME_OFFSET, TIME_OFFSET, fechaSegura]
        });

        const LABELS = {
            1: 'Servicio',
            2: 'Bebidas',
            3: 'Comida',
            4: 'Instalaciones'
        };

        const SCORE = {
            4: { label: 'Excelente', color: 'emerald' },
            3: { label: 'Bueno', color: 'blue' },
            2: { label: 'Regular', color: 'amber' },
            1: { label: 'Malo', color: 'rose' },
        };

        const log = result.rows.map(row => ({
            id: row.survey_id,
            mesero: row.mesero || 'Sin nombre',
            mesa: row.mesa || '-',
            turno: row.turno || '-',
            hora: row.hora ? new Date(row.hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '-',
            estado: 'Realizada',
            respuestas: [1, 2, 3, 4].map(q => ({
                label: LABELS[q],
                value: row[`q${q}`] || null,
                score: SCORE[row[`q${q}`]] || null
            }))
        }));

        res.status(StatusCodes.OK).json(log);
    } catch (error) {
        console.error("Error en getSurveysLog:", error);
        throw new InternalServerError("Error al obtener bitácora de encuestas");
    }
};

// Bitácora de encuestas rechazadas del día
export const getDeclinesLog = async (req, res) => {
    const { date } = req.query;
    const fechaSegura = safeDate(date);

    try {
        const result = await db.execute({
            sql: `
                SELECT
                    d.id,
                    w.name AS mesero,
                    d.table_number AS mesa,
                    d.shift AS turno,
                    datetime(d.created_at, ?) AS hora
                FROM declines d
                LEFT JOIN waiters w ON d.waiter_id = w.id
                WHERE date(datetime(d.created_at, ?)) = date(?)
                AND d.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)
                ORDER BY d.created_at ASC
            `,
            args: [TIME_OFFSET, TIME_OFFSET, fechaSegura]
        });

        const log = result.rows.map(row => ({
            id: row.id,
            mesero: row.mesero || 'Sin nombre',
            mesa: row.mesa || '-',
            turno: row.turno || '-',
            hora: row.hora ? new Date(row.hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '-',
            estado: 'Rechazada'
        }));

        res.status(StatusCodes.OK).json(log);
    } catch (error) {
        console.error("Error en getDeclinesLog:", error);
        throw new InternalServerError("Error al obtener bitácora de rechazos");
    }
};

/**
 * Reporte de rendimiento mensual por mesero.
 * Fórmula: Resultado Final = (Satisfacción × 50%) + (Cumplimiento × 50%)
 * Satisfacción = suma_p1 / (captadas × 4) × 100
 * Cumplimiento = captadas / mesas_reales × 100
 */
export const getWaiterPerformanceReport = async (req, res) => {
    const { month, year } = req.query;
    const { startDate, endDate } = getMonthRange(month, year);

    try {
        const [surveysResult, realTablesResult] = await Promise.all([
            // Encuestas captadas por kiosko + suma de calificaciones de P1
            db.execute({
                sql: `
                    SELECT
                        w.id,
                        w.name AS mesero,
                        COUNT(DISTINCT r.survey_id) AS captadas,
                        COALESCE(SUM(CASE WHEN r.question_id = 1 THEN r.value ELSE 0 END), 0) AS suma_p1
                    FROM waiters w
                    LEFT JOIN reactions r ON w.id = r.waiter_id
                        AND date(datetime(r.created_at, ?)) BETWEEN date(?) AND date(?)
                    WHERE w.active = 1
                    AND w.is_test = 0
                    GROUP BY w.id, w.name
                    ORDER BY w.name ASC
                `,
                args: [TIME_OFFSET, startDate, endDate]
            }),
            // Mesas reales capturadas por el gerente día a día
            db.execute({
                sql: `
                    SELECT waiter_id, SUM(table_count) AS mesas_reales
                    FROM realtables
                    WHERE date BETWEEN ? AND ?
                    GROUP BY waiter_id
                `,
                args: [startDate, endDate]
            })
        ]);

        const realTablesMap = {};
        realTablesResult.rows.forEach(r => {
            realTablesMap[r.waiter_id] = r.mesas_reales;
        });

        const report = surveysResult.rows.map(row => {
            const captadas = row.captadas || 0;
            const sumaP1 = row.suma_p1 || 0;
            const mesasReales = realTablesMap[row.id] || 0;

            // Factor Servicio: calidad de atención según P1
            const satisfaccion = captadas > 0 ? (sumaP1 / (captadas * 4)) * 100 : 0;
            const factorServicio = satisfaccion * 0.5;

            // Factor Cumplimiento: qué tan bien cubrió las mesas del gerente
            const cumplimiento = mesasReales > 0 ? (captadas / mesasReales) * 100 : 0;
            const factorCumplimiento = cumplimiento * 0.5;

            const resultadoFinal = factorServicio + factorCumplimiento;

            return {
                id: row.id,
                mesero: row.mesero,
                captadas,
                suma_p1: sumaP1,
                mesas_reales: mesasReales,
                satisfaccion: satisfaccion.toFixed(2),
                cumplimiento: cumplimiento.toFixed(2),
                resultado_final: mesasReales > 0 ? resultadoFinal.toFixed(2) : null
            };
        });

        res.status(StatusCodes.OK).json(report);
    } catch (error) {
        console.error("Error en getWaiterPerformanceReport:", error);
        throw new InternalServerError("Error al obtener reporte de rendimiento");
    }
};