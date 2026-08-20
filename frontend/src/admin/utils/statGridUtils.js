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
  // Manejo de estados básicos (cargando, error o sin datos)
  if (loading) return { value: null, subtitle: null, tooltip: null };
  if (error) return { value: "error", subtitle: "Fallo al cargar", tooltip: null };
  if (!data || data.length === 0) return { value: "Sin datos", subtitle: "No hay registros", tooltip: null };

  // Separamos a los meseros según su turno
  const byShift = {};
  data.forEach(w => {
    if (!byShift[w.turno]) byShift[w.turno] = [];
    byShift[w.turno].push(w);
  });

  // Armamos el texto por cada turno (Mañana y Tarde)
  const parts = Object.entries(byShift).map(([turno, meseros]) => {
    // Acomodamos de menor a mayor cantidad de encuestas por si acaso
    meseros.sort((a, b) => a.encuestas - b.encuestas);
    
    // Identificamos cuál fue el número más bajo de encuestas y quiénes lo sacaron
    const minEncuestas = meseros[0].encuestas;
    const meserosConMinimo = meseros.filter(w => w.encuestas === minEncuestas);

    let nombres = "";
    
    // Decidimos cómo mostrar los nombres dependiendo de cuántos meseros hay
    if (meseros.length === 1) {
      nombres = `${meseros[0].mesero}`;
    } else if (meserosConMinimo.length > 2) {
      nombres = `${meserosConMinimo[0].mesero}, ${meserosConMinimo[1].mesero} y +${meserosConMinimo.length - 2}`;
    } else {
      nombres = meserosConMinimo.map(w => w.mesero).join(' y ');
    }

    let subtituloTurno = "";
    
    // Ajustamos el texto del subtítulo si hay empates o es un mesero único
    if (meseros.length === 1) {
      nombres = `Único: ${meseros[0].mesero}`;
      subtituloTurno = `${minEncuestas} encuestas`;
    } else if (meserosConMinimo.length >= 2) {
      subtituloTurno = `Empate con ${minEncuestas} enc.`;
    } else {
      subtituloTurno = `${minEncuestas} encuestas`;
    }

    return {
      turnoAbreviado: turno === 'Desayuno' ? 'Mañana' : 'Tarde',
      nombres,
      subtituloTurno
    };
  });

  // Unimos los textos finales separando los turnos con un " | "
  const finalValue = parts.map(p => p.nombres).join(' | ');
  const finalSubtitle = parts.map(p => `${p.turnoAbreviado}: ${p.subtituloTurno}`).join(' | ');

  // Retornamos el objeto listo para inyectarlo en la UI
  return {
    value: finalValue,
    subtitle: finalSubtitle,
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