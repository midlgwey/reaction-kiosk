// frontend/src/admin/hooks/attendance/useAttendance.js
import { useState, useCallback } from 'react';
import api from '../../services/api';

export const useAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los turnos disponibles
  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/attendance/shifts');
      setShifts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar turnos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener asistencia por rango de fechas
  const fetchAttendanceByRange = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/attendance/range', {
        params: { startDate, endDate }
      });
      setAttendance(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar asistencia');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener asistencia de una fecha específica
  const fetchAttendanceByDate = useCallback(async (attendanceDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/attendance/date/${attendanceDate}`);
      setAttendance(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar asistencia');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener asistencia de un empleado
  const fetchEmployeeAttendance = useCallback(async (employeeId, startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/attendance/employee/${employeeId}`, {
        params: { startDate, endDate }
      });
      setAttendance(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar asistencia');
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar entrada
  const checkIn = async (employeeId, attendanceDate, shiftId, checkInTime) => {
    setLoading(true);
    try {
      const response = await api.post('/attendance/check-in', {
        employeeId,
        attendanceDate,
        shiftId,
        checkInTime
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al registrar entrada';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Marcar salida
  const checkOut = async (employeeId, attendanceDate, checkOutTime) => {
    setLoading(true);
    try {
      const response = await api.post('/attendance/check-out', {
        employeeId,
        attendanceDate,
        checkOutTime
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al registrar salida';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Marcar falta
  const markAbsence = async (employeeId, attendanceDate, justification = null) => {
    setLoading(true);
    try {
      const response = await api.post('/attendance/absence', {
        employeeId,
        attendanceDate,
        justification
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al registrar falta';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Marcar incapacidad
  const markIncapacity = async (employeeId, attendanceDate, justification) => {
    setLoading(true);
    try {
      const response = await api.post('/attendance/incapacity', {
        employeeId,
        attendanceDate,
        justification
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al registrar incapacidad';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Obtener resumen mensual
  const fetchMonthlySummary = useCallback(async (month, year) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/attendance/summary/month', {
        params: { month, year }
      });
      setAttendance(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar resumen');
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar justificación
  const updateJustification = async (attendanceId, justification) => {
    setLoading(true);
    try {
      const response = await api.put(`/attendance/${attendanceId}/justification`, {
        justification
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al actualizar justificación';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

 const updateRecord = async (employeeId, attendanceDate, data) => {
  try {
    const response = await api.put('/attendance/update-record', {
      employeeId,
      attendanceDate,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      status: data.status,
      justification: data.justification
    });
    return { success: true, message: response.data.message };
  } catch (err) {
    const message = err.response?.data?.message || 'Error al actualizar asistencia';
    return { success: false, error: message };
  }
};

  return {
    attendance,
    shifts,
    loading,
    error,
    fetchShifts,
    fetchAttendanceByRange,
    fetchAttendanceByDate,
    fetchEmployeeAttendance,
    fetchMonthlySummary,
    checkIn,
    checkOut,
    markAbsence,
    markIncapacity,
    updateJustification,
    updateRecord
  };
};