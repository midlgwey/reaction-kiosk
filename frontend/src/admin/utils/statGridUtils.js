// ─── Día de la semana ─────────────────────────────────────────────────────────
// El restaurante cierra los lunes (dayOfWeek === 1).
// Los martes (dayOfWeek === 2), "ayer" fue lunes (cerrado), no hay nada que comparar.
const dayOfWeek = new Date().getDay(); // 0=dom, 1=lun, 2=mar, 3=mié...
const isMonday  = dayOfWeek === 1;
const isTuesday = dayOfWeek === 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Trend visual normal
function getTrendIndicator(trend) {
  if (trend > 0) {
    return { icon: "↑", color: "text-emerald-600", label: `+${trend}` };
  } else if (trend < 0) {
    return { icon: "↓", color: "text-rose-600", label: `${trend}` };
  }
  return { icon: "→", color: "text-slate-400", label: "0" };
}

// Trend para día cerrado (lunes)
const CLOSED_DAY = {
  icon: "—",
  label: "Sin datos (día cerrado)",
  color: "text-slate-400"
};

// Trend para cuando el día anterior no tuvo encuestas (martes)
const NO_DATA_YESTERDAY = {
  icon: "—",
  label: "Sin datos ayer",
  color: "text-slate-400"
};

/**
 * Decide qué trend mostrar:
 * - Lunes  → "— Sin datos (día cerrado)"
 * - Martes → "— Sin datos ayer" (el lunes estuvo cerrado)
 * - Ayer sin encuestas → "— Sin datos ayer"
 * - Normal → trend calculado
 */
function resolveTrend(trendValue, yesterdayTotal) {
  if (isMonday)  return CLOSED_DAY;
  if (isTuesday) return NO_DATA_YESTERDAY;
  if (!yesterdayTotal || yesterdayTotal === 0) return NO_DATA_YESTERDAY;
  return getTrendIndicator(trendValue);
}

/**
 * Decide qué trendTooltip mostrar.
 */
function resolveTrendTooltip(yesterdayTotal, tooltipText) {
  if (isMonday)  return "El restaurante no abre los lunes";
  if (isTuesday) return "Ayer fue lunes, día cerrado";
  if (!yesterdayTotal || yesterdayTotal === 0) return "Sin encuestas el día anterior";
  return tooltipText;
}

// ─── Builders ─────────────────────────────────────────────────────────────────

const CLOSED_RETURN = { value: "—", subtitle: "Día cerrado", trend: CLOSED_DAY, trendTooltip: "El restaurante no abre los lunes" };

export function buildReactionsCard({ loading, error, totalReactions, trend, yesterdayTotal }) {
  if (loading) return { value: null, subtitle: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", trend: null };
  if (isMonday) return CLOSED_RETURN;
  if (totalReactions === 0) return { value: "0", subtitle: "Aún no hay reacciones hoy", trend: null };

  return {
    value: totalReactions,
    subtitle: "Total de reacciones del día",
    trend: resolveTrend(trend, yesterdayTotal),
    trendTooltip: resolveTrendTooltip(
      yesterdayTotal,
      trend > 0
        ? `${trend} más reacciones que ayer`
        : trend < 0
        ? `${Math.abs(trend)} menos reacciones que ayer`
        : `Igual que ayer`
    )
  };
}

export function buildServerScoreCard({ loading, error, totalResponses, avgScore, trend, yesterdayScore }) {
  if (loading) return { value: null, subtitle: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", trend: null };
  if (isMonday) return CLOSED_RETURN;
  if (totalResponses === 0) return { value: "0", subtitle: "Aún no hay reacciones hoy", trend: null };

  return {
    value: `${(avgScore || 0).toFixed(1)} / 4`,
    subtitle: "Promedio del servicio hoy",
    trend: resolveTrend(trend, yesterdayScore),
    trendTooltip: resolveTrendTooltip(
      yesterdayScore,
      trend > 0
        ? `Mejora de ${trend} vs ayer`
        : trend < 0
        ? `Baja de ${Math.abs(trend)} vs ayer`
        : `Sin cambio vs ayer`
    )
  };
}

export function buildLowInteractionCard({ loading, error, data }) {
  if (loading) return { value: null, subtitle: null, tooltip: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", tooltip: null, trend: null };
  if (isMonday) return { value: "—", subtitle: "Día cerrado", tooltip: null, trend: null };
  if (data.length === 0) return { value: "Sin actividad", subtitle: "Sin encuestas hoy", tooltip: null, trend: null };

  const byShift = {};
  data.forEach(w => {
    if (!byShift[w.turno]) byShift[w.turno] = [];
    byShift[w.turno].push(w);
  });

  const parts = Object.entries(byShift).map(([turno, meseros]) => {
    if (meseros[0].unico) {
      return {
        value: meseros[0].mesero,
        subtitle: `Único en ${turno}`,
        tooltip: `${turno}\n${meseros[0].mesero}: ${meseros[0].encuestas} enc.`
      };
    }
    return {
      value: meseros.map(w => w.mesero).join(' y '),
      subtitle: turno,
      tooltip: `${turno}\n` + meseros.map(w => `${w.mesero}: ${w.encuestas} enc.`).join('\n')
    };
  });

  return {
    value: parts[0].value,
    subtitle: parts.map(p => p.subtitle).join(' · '),
    tooltip: parts.map(p => p.tooltip).join('\n\n'),
    trend: null // Sin trend para esta card
  };
}

export function buildSurveyCountCard({ loading, error, data }) {
  if (loading) return { value: null, subtitle: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", trend: null };
  if (isMonday) return CLOSED_RETURN;

  return {
    value: `${data.realizadas} | ${data.rechazadas}`,
    subtitle: `Realizadas | No Realizadas`,
    trend: resolveTrend(data.trendSurveys, data.yesterdaySurveys),
    trendTooltip: resolveTrendTooltip(
      data.yesterdaySurveys,
      data.trendSurveys > 0
        ? `${data.trendSurveys} más encuestas que ayer`
        : data.trendSurveys < 0
        ? `${Math.abs(data.trendSurveys)} menos encuestas que ayer`
        : `Igual que ayer`
    )
  };
}

export function buildLowestRatedWaiterCard({ loading, error, data }) {
  if (loading) return { value: null, subtitle: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", trend: null };
  if (isMonday) return CLOSED_RETURN;
  if (data.mesero === "Sin datos") return { value: "Ningún mesero", subtitle: "Sin encuestas hoy", trend: null };

  if (data.avgScore >= 4.0) {
    return { value: "Ningún mesero", subtitle: "Todos con excelente desempeño", trend: null };
  }

  return {
    value: `${data.mesero}`,
    subtitle: `${(data.avgScore || 0).toFixed(1)} / 4 (${data.totalResponses} enc.)`,
    trend: resolveTrend(data.trend, data.yesterdayScore),
    trendTooltip: resolveTrendTooltip(
      data.yesterdayScore,
      data.trend > 0
        ? `Mejoró ${data.trend} vs ayer`
        : data.trend < 0
        ? `Bajó ${Math.abs(data.trend)} vs ayer`
        : `Sin cambio vs ayer`
    )
  };
}

export function buildWorstRatedQuestionCard({ loading, error, data }) {
  if (loading) return { value: null, subtitle: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", trend: null };
  if (isMonday) return CLOSED_RETURN;
  if (data.questionLabel === "Sin datos") return { value: "Sin datos", subtitle: "Sin encuestas hoy", trend: null };

  const shortLabel = data.questionLabel.length > 35
    ? data.questionLabel.substring(0, 32) + "..."
    : data.questionLabel;

  return {
    value: `${(data.avgScore || 0).toFixed(1)} / 4`,
    subtitle: shortLabel,
    trend: resolveTrend(data.trend, data.yesterdayScore),
    tooltip: `Pregunta: ${data.questionLabel}\nCalificación: ${data.avgScore}/4\nTotal de respuestas: ${data.totalResponses}`,
    trendTooltip: resolveTrendTooltip(
      data.yesterdayScore,
      data.trend > 0
        ? `Mejoró ${data.trend} vs ayer`
        : data.trend < 0
        ? `Bajó ${Math.abs(data.trend)} vs ayer`
        : `Sin cambio vs ayer`
    )
  };
}