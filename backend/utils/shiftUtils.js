export function getShiftByTime() {

  const now = new Date();

  // Helper para forzar zona horaria (útil si se requiere precisión extra en integers)
  const getTijuanaPart = (part) => {
    const f = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Tijuana",
      [part]: "numeric",
      hour12: false 
    });
    return parseInt(f.format(now));
  };

  // Crear objeto Date basado en la hora local de Tijuana
  const tijuanaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Tijuana" }));
  
  const day = tijuanaDate.getDay(); 
  const hour = tijuanaDate.getHours();
  const minutes = tijuanaDate.getMinutes();

  // Normalización del tiempo a minutos del día para comparaciones de rango
  const currentTime = hour * 60 + minutes;

  // Lunes: Día inhabilitado
  if (day === 1) return "Cerrado";

  /* -------------------------------------------------
     Semana Laboral (Martes - Viernes)
     Corte de turno: 1:00 PM (780 min)
     Cierre: 10:00 PM (1320 min)
  ------------------------------------------------- */

  

  if (day >= 2 && day <= 5) {
    // Rango: 8:00 AM - 12:59 PM
    if (currentTime >= 480 && currentTime < 780) return "Desayuno"; 
    // Rango: 1:00 PM - 10:00 PM
    if (currentTime >= 780 && currentTime <= 1320) return "Comida/Cena";
  }

  /* -------------------------------------------------
     Sábado
     Corte de turno: 1:45 PM (825 min)
     Cierre: 10:00 PM (1320 min)
  ------------------------------------------------- */


  
  if (day === 6) {
    // Rango: 8:00 AM - 1:45 PM
    if (currentTime >= 480 && currentTime <= 825) return "Desayuno";
    // Rango: 1:46 PM - 10:00 PM
    if (currentTime > 825 && currentTime <= 1320) return "Comida/Cena";
  }

  /* -------------------------------------------------
     Domingo (Cierre temprano)
     Corte de turno: 1:45 PM (825 min)
     Cierre: 6:00 PM (1080 min)
  ------------------------------------------------- */

  
  if (day === 0) {
    // Rango: 8:00 AM - 1:45 PM
    if (currentTime >= 480 && currentTime <= 825) return "Desayuno";
    // Rango: 1:46 PM - 6:00 PM
    if (currentTime > 825 && currentTime <= 1080) return "Comida/Cena";
  }

  return "Fuera de horario";
  
}

