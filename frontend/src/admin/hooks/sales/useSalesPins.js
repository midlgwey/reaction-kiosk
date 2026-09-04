// frontend/src/admin/hooks/sales/useSalesPins.js
import { useState, useEffect, useCallback } from 'react';

const PIN_REGISTRO = '197006';
const PIN_MODIFICACION = '900830';
const PIN_DURACION_MS = 3 * 60 * 60 * 1000; // 3 horas en ms

// Calcula los días laborales (sin lunes) anteriores a hoy
const getPreviousWorkDays = (date, count) => {
  const days = [];
  let current = new Date(date);
  
  while (days.length < count) {
    current.setDate(current.getDate() - 1);
    if (current.getDay() !== 1) { // no es lunes
      days.push(new Date(current));
    }
  }
  
  return days.sort((a, b) => b - a); // ordenar descendente (más reciente primero)
};

// Formatea fecha para comparar: 'yyyy-MM-dd'
const formatDateOnly = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const useSalesPins = () => {
  const [registroPinVerified, setRegistroPinVerified] = useState(false);
  const [registroPinExpireTime, setRegistroPinExpireTime] = useState(null);
  const [registroPinError, setRegistroPinError] = useState(false);

  // Restaurar estado del PIN de registro desde sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('registroPinVerified');
    const expireTime = sessionStorage.getItem('registroPinExpireTime');
    
    if (stored && expireTime) {
      const now = Date.now();
      if (now < parseInt(expireTime)) {
        setRegistroPinVerified(true);
        setRegistroPinExpireTime(parseInt(expireTime));
      } else {
        sessionStorage.removeItem('registroPinVerified');
        sessionStorage.removeItem('registroPinExpireTime');
      }
    }
  }, []);

  // Verificar si el PIN de registro aún es válido
  const isRegistroPinValid = useCallback(() => {
    if (!registroPinVerified) return false;
    if (!registroPinExpireTime) return false;
    
    const now = Date.now();
    if (now >= registroPinExpireTime) {
      setRegistroPinVerified(false);
      sessionStorage.removeItem('registroPinVerified');
      sessionStorage.removeItem('registroPinExpireTime');
      return false;
    }
    
    return true;
  }, [registroPinVerified, registroPinExpireTime]);

  // Verificar PIN de registro
  const verifyRegistroPin = useCallback((pin) => {
    setRegistroPinError(false);
    
    if (pin === PIN_REGISTRO) {
      const expireTime = Date.now() + PIN_DURACION_MS;
      setRegistroPinVerified(true);
      setRegistroPinExpireTime(expireTime);
      sessionStorage.setItem('registroPinVerified', 'true');
      sessionStorage.setItem('registroPinExpireTime', String(expireTime));
      return true;
    } else {
      setRegistroPinError(true);
      return false;
    }
  }, []);

  // Verificar PIN de modificación (sin duración, se verifica cada vez)
  const verifyModificacionPin = useCallback((pin) => {
    return pin === PIN_MODIFICACION;
  }, []);

  // Determinar si puede editar una venta sin PIN
  const canEditWithoutPin = useCallback((saleDate) => {
    const today = new Date();
    const saleDay = new Date(saleDate);
    
    // Mismo día — siempre puede editar
    if (formatDateOnly(today) === formatDateOnly(saleDay)) {
      return true;
    }

    // Últimos 2 días laborales
    const previousDays = getPreviousWorkDays(today, 2);
    for (const prevDay of previousDays) {
      if (formatDateOnly(prevDay) === formatDateOnly(saleDay)) {
        return true;
      }
    }

    return false;
  }, []);

  const clearRegistroPin = useCallback(() => {
    setRegistroPinVerified(false);
    setRegistroPinExpireTime(null);
    sessionStorage.removeItem('registroPinVerified');
    sessionStorage.removeItem('registroPinExpireTime');
  }, []);

  return {
    // Estado del PIN de registro
    registroPinVerified,
    registroPinExpireTime,
    registroPinError,
    isRegistroPinValid,
    verifyRegistroPin,
    clearRegistroPin,
    
    // PIN de modificación
    verifyModificacionPin,
    canEditWithoutPin
  };
};