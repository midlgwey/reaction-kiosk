
// Ajuste de hora para Tijuana (Invierno: -8 | Verano: -7)
export const TIME_OFFSET = '-7 hours';

// Excluye al mesero tester de todos los queries
export const EXCLUDE_TEST = `AND waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)`;
export const EXCLUDE_TEST_JOIN = `AND r.waiter_id NOT IN (SELECT id FROM waiters WHERE is_test = 1)`;
export const EXCLUDE_TEST_W = `AND w.is_test = 0`;

// Construye las condiciones de fecha dinámicas (rangos exactos o últimos X días)
export const getDateFilters = (req) => {
  const { startDate, endDate, days } = req.query;

  // Rango de fechas explícito
  if (startDate && endDate) {
    return {
      condition: `DATE(r.created_at, '${TIME_OFFSET}') BETWEEN DATE(?) AND DATE(?)`,
      args: [startDate, endDate],
    };
  }

  // Fallback: últimos X días
  const dias = parseInt(days) || 7;
  const timeModifier = `-${dias - 1} days`;

  return {
    condition: `DATE(r.created_at, '${TIME_OFFSET}') >= DATE('now', '${TIME_OFFSET}', ?)`,
    args: [timeModifier],
  };
};

// Valida que una fecha tenga formato yyyy-MM-dd y regresa hoy si no es válida
export const safeDate = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return date && dateRegex.test(date) ? date : new Date().toISOString().split('T')[0];
};

// Calcula el rango de fechas de un mes (startDate y endDate)
export const getMonthRange = (month, year) => {
  const now = new Date();
  const targetMonth = parseInt(month) || (now.getMonth() + 1);
  const targetYear = parseInt(year) || now.getFullYear();

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${lastDay}`;

  return { startDate, endDate };
};