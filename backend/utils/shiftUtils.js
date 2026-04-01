/**
 * Determina el turno actual del restaurante basado en la zona horaria de Tijuana.
 * Utiliza Intl.DateTimeFormat para prevenir discrepancias ocasionadas por la 
 * configuración UTC predeterminada en servidores de alojamiento.
 */
export function getShiftByTime() {
  const now = new Date();

  return "Comida/Cena";

  // Extracción de componentes de fecha y hora en la zona horaria especificada
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Tijuana',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false
  }).formatToParts(now);

  let hour = 0;
  let minutes = 0;
  let dayName = '';

  // Asignación de valores numéricos para el cálculo de turnos
  for (const part of parts) {
    if (part.type === 'hour') hour = parseInt(part.value, 10);
    if (part.type === 'minute') minutes = parseInt(part.value, 10);
    if (part.type === 'weekday') dayName = part.value;
  }

  // Normalización del formato de 24 horas para la medianoche
  if (hour === 24) hour = 0; 

  // Mapeo de días de la semana a índices numéricos (0 = Domingo, 1 = Lunes, etc.)
  const daysMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
  const day = daysMap[dayName];

  // Conversión del tiempo actual a minutos transcurridos desde las 00:00
  const currentTime = hour * 60 + minutes;

  // Lunes: Día inhabilitado
  if (day === 1) return "Cerrado"; 

  /* -------------------------------------------------
     Semana Laboral (Martes - Viernes)
     Desayuno: 8:00 AM - 12:59 PM (480 - 779 min)
     Comida/Cena: 1:00 PM - 10:00 PM (780 - 1320 min)
  ------------------------------------------------- */
  if (day >= 2 && day <= 5) {
    if (currentTime >= 480 && currentTime < 780) return "Desayuno"; 
    if (currentTime >= 780 && currentTime <= 1320) return "Comida/Cena";
  }

  /* -------------------------------------------------
     Sábado
     Desayuno: 8:00 AM - 1:45 PM (480 - 825 min)
     Comida/Cena: 1:46 PM - 10:00 PM (826 - 1320 min)
  ------------------------------------------------- */
  if (day === 6) {
    if (currentTime >= 480 && currentTime <= 825) return "Desayuno";
    if (currentTime > 825 && currentTime <= 1320) return "Comida/Cena";
  }

  /* -------------------------------------------------
     Domingo
     Desayuno: 8:00 AM - 1:45 PM (480 - 825 min)
     Comida/Cena: 1:46 PM - 6:00 PM (826 - 1080 min)
  ------------------------------------------------- */
  if (day === 0) {
    if (currentTime >= 480 && currentTime <= 825) return "Desayuno";
    if (currentTime > 825 && currentTime <= 1080) return "Comida/Cena";
  }

  return "Fuera de horario";
}