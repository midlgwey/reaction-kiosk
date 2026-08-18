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
  if (error) return { value: "error", subtitle: "Fallo al cargar", tooltip: null };
  if (!data || data.length === 0) return { value: "Sin datos", subtitle: "No hay registros", tooltip: null };

  const byShift = {};
  data.forEach(w => {
    if (!byShift[w.turno]) byShift[w.turno] = [];
    byShift[w.turno].push(w);
  });

  const parts = Object.entries(byShift).map(([turno, meseros]) => {
    const minEncuestas = meseros[0].encuestas;
    const meserosConMinimo = meseros.filter(w => w.encuestas === minEncuestas);

    let nombres = "";
    // Manejo inteligente de empates para no saturar la tarjeta
    if (meserosConMinimo.length > 2) {
      nombres = `${meserosConMinimo[0].mesero}, ${meserosConMinimo[1].mesero} y +${meserosConMinimo.length - 2}`;
    } else {
      nombres = meserosConMinimo.map(w => w.mesero).join(' y ');
    }

    // Subtítulos más limpios
    let subtituloTurno = "";
    if (meseros.length === 1 && minEncuestas > 0) {
      subtituloTurno = `Único con ${minEncuestas} enc.`;
    } else if (meserosConMinimo.length >= 2) {
      subtituloTurno = `Empate con ${minEncuestas} enc.`;
    } else {
      subtituloTurno = `${minEncuestas} encuestas`;
    }

    // Retornamos un objeto estructurado en lugar de un string largo
    return {
      turnoAbreviado: turno === 'Desayuno' ? 'Mañana' : 'Tarde',
      nombres,
      subtituloTurno
    };
  });

 // Unimos los textos separando los turnos con ' | '
  let finalValue = parts.map(p => p.nombres).join(' | ');
  const finalSubtitle = parts.map(p => `${p.turnoAbreviado}: ${p.subtituloTurno}`).join(' | ');

  // Límite de caracteres para no romper el diseño de la tarjeta
  const LIMITE_LETRAS = 11; 
  
  // Si el texto se pasa del límite, lo cortamos y agregamos '...'
  if (finalValue.length > LIMITE_LETRAS) {
    finalValue = finalValue.substring(0, LIMITE_LETRAS) + '...'; 
  }

  // Devolvemos la info lista para mostrarse en la UI
  return {
    value: finalValue,
    subtitle: finalSubtitle,
    // Guardamos la info completa aquí para mostrarla al pasar el cursor
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