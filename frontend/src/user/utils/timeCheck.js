/**
 * Determina el turno actual basado en la zona horaria de Tijuana.
 * Reutiliza la lógica exacta del backend para mantener consistencia.
 */
export function getShiftByTime() {
  const now = new Date();

  // Forzar zona horaria America/Tijuana
  const tijuanaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Tijuana" }));
  
  const day = tijuanaDate.getDay(); 
  const hour = tijuanaDate.getHours();
  const minutes = tijuanaDate.getMinutes();

  // Normalización del tiempo a minutos del día
  const currentTime = hour * 60 + minutes;

  // Lunes: Cerrado
  if (day === 1) return "Fuera de horario";

  // Martes - Viernes
  if (day >= 2 && day <= 5) {
    if (currentTime >= 480 && currentTime < 780) return "Desayuno"; 
    if (currentTime >= 780 && currentTime <= 1320) return "Comida/Cena";
  }

  // Sábado
  if (day === 6) {
    if (currentTime >= 480 && currentTime <= 825) return "Desayuno";
    if (currentTime > 825 && currentTime <= 1320) return "Comida/Cena";
  }

  // Domingo
  if (day === 0) {
    if (currentTime >= 480 && currentTime <= 825) return "Desayuno";
    if (currentTime > 825 && currentTime <= 1080) return "Comida/Cena";
  }

  return "Fuera de horario";
}