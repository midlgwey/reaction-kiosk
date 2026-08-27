// src/hooks/useSchedule.js
import { useState } from "react";
import { 
  fetchWeeklySchedule, 
  saveSchedule, 
  publishSchedule, 
  uploadSchedulePdf 
} from "../../services/scheduleService";

export const useSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);

  const getSchedule = async (weekStartDate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeeklySchedule(weekStartDate);
      setScheduleData(data);
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        setScheduleData(null); // 👈 limpia el estado al no encontrar horario
      } else {
        const msg = err.response?.data?.message || "Error al cargar el horario";
        setError(msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveWeeklySchedule = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await saveSchedule(payload);
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || "Error al guardar el horario";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const publishWeeklySchedule = async (workScheduleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await publishSchedule(workScheduleId);
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || "Error al publicar el horario";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadPdf = async (workScheduleId, formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await uploadSchedulePdf(workScheduleId, formData);
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || "Error al subir el archivo";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    scheduleData,
    loading,
    error,
    getSchedule,
    saveWeeklySchedule,
    publishWeeklySchedule,
    uploadPdf,
  };
};