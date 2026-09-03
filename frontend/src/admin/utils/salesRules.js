import { startOfDay, subDays, getDay, isSameDay } from 'date-fns';

const PIN_SESSION_HOURS = 3;
export const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '990830';
export const SESSION_PIN = import.meta.env.VITE_SUPERVISOR_PIN || '197006';

// Valida si la sesión de 3 horas sigue activa
export const isPinSessionActive = () => {
  const expiry = localStorage.getItem('sales_pin_expiry');
  if (!expiry) return false;
  return Date.now() < parseInt(expiry, 10);
};

// Inicia la sesión de 3 horas
export const startPinSession = () => {
  const expiryTime = Date.now() + (PIN_SESSION_HOURS * 60 * 60 * 1000);
  localStorage.setItem('sales_pin_expiry', expiryTime.toString());
};

// Calcula los días permitidos sin PIN (Hoy + 2 operativos pasados, sin Lunes)
export const getFreeWindowDates = () => {
  const dates = [];
  let current = startOfDay(new Date());

  // Queremos juntar 3 días válidos (Hoy + 2 anteriores)
  while (dates.length < 3) {
    if (getDay(current) !== 1) { // 1 es Lunes en date-fns
      dates.push(current);
    }
    current = subDays(current, 1);
  }
  return dates;
};

// Verifica si la fecha de la venta está dentro de la ventana libre
export const isDateInFreeWindow = (saleDateString) => {
  if (!saleDateString) return true; // Si es registro nuevo, se asume que es el día default
  const targetDate = startOfDay(new Date(saleDateString + 'T00:00:00'));
  const freeDates = getFreeWindowDates();
  
  return freeDates.some(freeDate => isSameDay(freeDate, targetDate));
};