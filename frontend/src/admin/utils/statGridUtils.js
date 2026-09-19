// ─── Helpers ─────────────────────────────────────────────────────────────────
// Función para mostrar el trend de forma visual
function getTrendIndicator(trend) {
  if (trend > 0) {
    return { icon: "↑", color: "text-emerald-600", label: `+${trend}` };
  } else if (trend < 0) {
    return { icon: "↓", color: "text-rose-600", label: `${trend}` };
  }
  return { icon: "→", color: "text-slate-400", label: "0" };
}

// ─── Builders ─────────────────────────────────────────────────────────────────
// Cada función recibe el estado del hook y devuelve { value, subtitle, trend, trendTooltip }

export function buildReactionsCard({ loading, error, totalReactions, trend }) {
  if (loading) return { value: null, subtitle: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", trend: null };
  if (totalReactions === 0) return { value: "0", subtitle: "Aún no hay reacciones hoy", trend: null };

  const trendIndicator = getTrendIndicator(trend);

  return {
    value: totalReactions,
    subtitle: "Total de reacciones del día",
    trend: trendIndicator,
    trendTooltip: trend > 0 
      ? `${trend} más reacciones que ayer` 
      : trend < 0 
      ? `${Math.abs(trend)} menos reacciones que ayer` 
      : `Igual que ayer`
  };
}

export function buildServerScoreCard({ loading, error, totalResponses, avgScore, trend }) {
  if (loading) return { value: null, subtitle: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", trend: null };
  if (totalResponses === 0) return { value: "0", subtitle: "Aún no hay reacciones hoy", trend: null };

  const trendIndicator = getTrendIndicator(trend);

  return {
    value: `${(avgScore || 0).toFixed(1)} / 4`,
    subtitle: "Promedio del servicio hoy",
    trend: trendIndicator,
    trendTooltip: trend > 0 
      ? `Mejora de ${trend} vs ayer` 
      : trend < 0 
      ? `Baja de ${Math.abs(trend)} vs ayer` 
      : `Sin cambio vs ayer`
  };
}

export function buildLowInteractionCard({ loading, error, data }) {
  if (loading) return { value: null, subtitle: null, tooltip: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", tooltip: null, trend: null };
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
    trend: null // Sin trend como indicaste
  };
}

export function buildSurveyCountCard({ loading, error, data }) {
  if (loading) return { value: null, subtitle: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", trend: null };

  const trendSurveys = getTrendIndicator(data.trendSurveys || 0);

  return {
    value: `${data.realizadas} | ${data.rechazadas}`,
    subtitle: `Realizadas | No Realizadas`,
    trend: trendSurveys,
    trendTooltip: data.trendSurveys > 0 
      ? `${data.trendSurveys} más encuestas que ayer` 
      : data.trendSurveys < 0 
      ? `${Math.abs(data.trendSurveys)} menos encuestas que ayer` 
      : `Igual que ayer`
  };
}

// Nueva card: Mesero con baja calificación
// Solo muestra si calificación < 4.0 (no perfectas)
export function buildLowestRatedWaiterCard({ loading, error, data }) {
  if (loading) return { value: null, subtitle: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", trend: null };
  if (data.mesero === "Sin datos") return { value: "Ningún mesero", subtitle: "Sin encuestas hoy", trend: null };
  
  // Si la calificación es perfecta (4.0), no mostrar como "problema"
  if (data.avgScore >= 4.0) {
    return { value: "Ningún mesero", subtitle: "Todos con excelente desempeño", trend: null };
  }

  const trendIndicator = getTrendIndicator(data.trend);

  return {
    value: `${data.mesero}`,
    subtitle: `${(data.avgScore || 0).toFixed(1)} / 4 (${data.totalResponses} enc.)`,
    trend: trendIndicator,
    trendTooltip: data.trend > 0 
      ? `Mejoró ${data.trend} vs ayer` 
      : data.trend < 0 
      ? `Bajó ${Math.abs(data.trend)} vs ayer` 
      : `Sin cambio vs ayer`
  };
}

// Nueva card: Pregunta peor calificada
export function buildWorstRatedQuestionCard({ loading, error, data }) {
  if (loading) return { value: null, subtitle: null, trend: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", trend: null };
  if (data.questionLabel === "Sin datos") return { value: "Sin datos", subtitle: "Sin encuestas hoy", trend: null };

  const trendIndicator = getTrendIndicator(data.trend);
  
  // Acortar el label de la pregunta si es muy largo
  const shortLabel = data.questionLabel.length > 35 
    ? data.questionLabel.substring(0, 32) + "..."
    : data.questionLabel;

  return {
    value: `${(data.avgScore || 0).toFixed(1)} / 4`,
    subtitle: shortLabel,
    trend: trendIndicator,
    tooltip: `Pregunta: ${data.questionLabel}\nCalificación: ${data.avgScore}/4\nTotal de respuestas: ${data.totalResponses}`,
    trendTooltip: data.trend > 0 
      ? `Mejoró ${data.trend} vs ayer` 
      : data.trend < 0 
      ? `Bajó ${Math.abs(data.trend)} vs ayer` 
      : `Sin cambio vs ayer`
  };
}