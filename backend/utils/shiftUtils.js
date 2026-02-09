export function getShiftByTime() {

  
  const nowTijuana = new Date().toLocaleString("en-US", {
    timeZone: "America/Tijuana"
  });

  const date = new Date(nowTijuana);

  const day = date.getDay(); // 0 domingo
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const currentTime = hour * 60 + minutes;

  // LUNES CERRADO
  if (day === 1) return "Cerrado";

  /* ======================================================
     MARTES A VIERNES
     8:00 am - 12:59 pm → Desayuno
     1:00 pm - 10:00 pm → Comida/Cena
  ====================================================== */
  if (day >= 2 && day <= 5) {
    if (currentTime >= 480 && currentTime <= 779) {
      return "Desayuno"; // 8:00 - 12:59
    }

    if (currentTime >= 780 && currentTime <= 1320) {
      return "Comida/Cena"; // 1:00 - 10:00
    }
  }

  /* ======================================================
     SÁBADO
     8:00 am - 1:45 pm → Desayuno
     1:46 pm - 10:00 pm → Comida/Cena
  ====================================================== */
  if (day === 6) {
    if (currentTime >= 480 && currentTime <= 825) {
      return "Desayuno"; // hasta 1:45
    }

    if (currentTime >= 826 && currentTime <= 1320) {
      return "Comida/Cena";
    }
  }

  /* ======================================================
     DOMINGO
     8:00 am - 1:45 pm → Desayuno
     1:46 pm - 6:00 pm → Comida/Cena
  ====================================================== */
  if (day === 0) {
    if (currentTime >= 480 && currentTime <= 825) {
      return "Desayuno";
    }

    if (currentTime >= 826 && currentTime <= 1080) {
      return "Comida/Cena"; 
    }
  }

  return "Fuera de horario";
}
