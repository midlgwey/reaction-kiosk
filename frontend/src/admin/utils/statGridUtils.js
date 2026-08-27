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
 
// Da formato a los datos para mostrarlos bonitos en la tarjeta del dashboard
export function buildLowInteractionCard({ loading, error, data }) {
  if (loading) return { value: null, subtitle: null, tooltip: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", tooltip: null };
  if (data.length === 0) return { value: "Sin actividad", subtitle: "Sin encuestas hoy", tooltip: null };

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
    value: parts[0].value, // solo muestra el primero en la card
    subtitle: parts.map(p => p.subtitle).join(' · '),
    tooltip: parts.map(p => p.tooltip).join('\n\n') // desglose completo en el modal
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