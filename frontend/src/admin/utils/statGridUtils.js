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
  if (loading) return { value: null, subtitle: null, tooltip: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar datos", tooltip: null };
  if (!data || data.length === 0) return { value: "Sin datos", subtitle: "No hay registros hoy", tooltip: null };

  const byShift = {};
  data.forEach(w => {
    if (!byShift[w.turno]) byShift[w.turno] = [];
    byShift[w.turno].push(w);
  });

  const parts = Object.entries(byShift).map(([turno, meseros]) => {
    const minEncuestas = meseros[0].encuestas;
    const meserosConMinimo = meseros.filter(w => w.encuestas === minEncuestas);

    let mainText = "";
    
    // Regla 1: Si nadie tiene encuestas o el mínimo es 0 con muchos
    if (minEncuestas === 0 && meseros.length > 1) {
      mainText = "Sin interacciones";
    } 
    // Regla 2: Si solo un mesero tuvo encuestas en el turno (fue el único)
    else if (meseros.length === 1 && minEncuestas > 0) {
      mainText = "Único con enc. en su turno";
    } 
    // Regla 3: Si hay 2 o más meseros con las encuestas mínimas (ej. 2 encuestas)
    else if (meserosConMinimo.length >= 2) {
      mainText = `Varios meseros tienen ${minEncuestas} enc.`;
    } 
    // Regla 4: Caso estándar, muestra el nombre del mesero con menos encuestas
    else {
      mainText = meserosConMinimo.map(w => w.mesero).join(' y ');
    }

    return {
      value: mainText,
      subtitle: `${turno}: ${minEncuestas} enc.`
    };
  });

  return {
    value: parts.map(p => p.value).join(' · '),
    subtitle: parts.map(p => p.subtitle).join(' · '),
    tooltip: data.map(w => `${w.mesero} (${w.turno}): ${w.encuestas} encuestas`).join('\n')
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