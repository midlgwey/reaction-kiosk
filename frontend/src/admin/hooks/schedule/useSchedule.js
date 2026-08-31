// frontend/src/admin/hooks/schedule/useSchedule.js
import { useState, useCallback } from 'react';
import {
  fetchWeeklySchedule,
  saveSchedule,
  publishSchedule,
  uploadSchedulePdf,
  fetchEmployees
} from '../../services/scheduleService';

export const useSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);

  // Obtener el horario de una semana
  const getSchedule = useCallback(async (weekStartDate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeeklySchedule(weekStartDate);
      setScheduleData(data);
      return data;
    } catch (err) {
      // Si no existe horario para esa semana, limpiar el estado
      if (err.response?.status === 404) {
        setScheduleData(null);
      } else {
        setError(err.response?.data?.message || 'Error al cargar el horario');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar o actualizar borrador
  const saveWeeklySchedule = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await saveSchedule(payload);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el horario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Publicar horario — ya no se puede editar después
  const publishWeeklySchedule = useCallback(async (workScheduleId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await publishSchedule(workScheduleId);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar el horario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Subir documento de permiso, cambio de turno o incapacidad
  const uploadPdf = useCallback(async (workScheduleId, formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadSchedulePdf(workScheduleId, formData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir el archivo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener todos los empleados activos
  const getEmployees = useCallback(async () => {
    try {
      const data = await fetchEmployees();
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    scheduleData,
    loading,
    error,
    getSchedule,
    saveWeeklySchedule,
    publishWeeklySchedule,
    uploadPdf,
    getEmployees
  };
};