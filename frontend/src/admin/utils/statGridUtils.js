// ─── Builders ─────────────────────────────────────────────────────────────────
// Cada función recibe el estado del hook y devuelve { value, subtitle }
// El JSX de StatCard solo consume estos dos campos.
 
export function buildReactionsCard({ loading, error, totalReactions }) {
  if (loading) return { value: null,    subtitle: null };
  if (error)   return { value: "error", subtitle: "Fallo al cargar datos" };
  if (totalReactions === 0) return { value: "0", subtitle: "Aún no hay reacciones hoy" };
 
  return {
    value:    totalReactions,
    subtitle: "Total de reacciones del día",
  };
}
 
export function buildServerScoreCard({ loading, error, totalResponses, avgScore }) {
  if (loading) return { value: null,    subtitle: null };
  if (error)   return { value: "error", subtitle: "Fallo al cargar datos" };
  if (totalResponses === 0) return { value: "0", subtitle: "Aún no hay reacciones hoy" };
 
  return {
    value:    `${(avgScore || 0).toFixed(1)} / 4`,
    subtitle: "Promedio del servicio hoy",
  };
}
 
export function buildLowInteractionCard({ loading, error, data }) {
  if (loading) return { value: null, subtitle: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos" };
  if (data.length === 0) return { value: "Sin datos", subtitle: "No hay registros hoy" };

  // Agrupa por turno para detectar si hay más de uno por turno
  const byShift = {};
  data.forEach(w => {
    if (!byShift[w.turno]) byShift[w.turno] = [];
    byShift[w.turno].push(w);
  });

  const parts = Object.entries(byShift).map(([turno, meseros]) => {
    if (meseros.length === 1) {
      return { value: meseros[0].mesero, subtitle: `Único en ${turno}` };
    }
    return {
      value: meseros.map(w => w.mesero).join(' y '),
      subtitle: `${turno}: ${meseros[0].encuestas} enc. cada uno`
    };
  });

  return {
    value: parts.map(p => p.value).join(' · '),
    subtitle: parts.map(p => p.subtitle).join(' · ')
  };
}
 

export function buildSurveyCountCard({ loading, error, data }) {
  if (loading) return { value: null, subtitle: null };
  if (error)   return { value: "error", subtitle: "Fallo al cargar datos" };

  return {
    value:    `${data.realizadas} | ${data.rechazadas}`,
    subtitle: `Realizadas | No Realizadas`,
  };
}