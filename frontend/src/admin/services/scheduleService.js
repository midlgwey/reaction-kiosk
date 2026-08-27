// src/admin/services/scheduleService.js
import api from "./api";

// Obtener horario por semana
export const fetchWeeklySchedule = async (weekStartDate) => {
  const { data } = await api.get(`/schedules/${weekStartDate}`);
  return data;
};

// Guardar o actualizar la matriz de turnos
export const saveSchedule = async (scheduleData) => {
  const { data } = await api.post("/schedules", scheduleData);
  return data;
};

// Publicar horario (bloquea edición)
export const publishSchedule = async (workScheduleId) => {
  const { data } = await api.patch(`/schedules/${workScheduleId}/publish`);
  return data;
};

// Subir PDF de permiso o cambio (con FormData)
export const uploadSchedulePdf = async (workScheduleId, formData) => {
  const { data } = await api.post(`/schedules/${workScheduleId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};