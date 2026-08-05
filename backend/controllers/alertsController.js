import { db } from '../db.js';
import { TIME_OFFSET } from '../utils/queryHelpers.js';

export const getRecentAlerts = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          a.id,
          a.type,
          a.message,
          datetime(a.created_at, '${TIME_OFFSET}') as date,
          a.created_at as raw_date,
          w.name as waiter_name,     
          r.table_number              

        FROM alerts a
        LEFT JOIN reactions r ON a.reaction_id = r.id
        LEFT JOIN waiters w ON r.waiter_id = w.id

        WHERE DATE(a.created_at, '${TIME_OFFSET}') = DATE('now', '${TIME_OFFSET}')
        AND (w.id IS NULL OR w.is_test = 0)

        ORDER BY a.created_at DESC
        LIMIT 5
      `
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error en getRecentAlerts:", error);
    res.status(500).json({ error: "No se pudieron cargar las alertas" });
  }
};