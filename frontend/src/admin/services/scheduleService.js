// frontend/src/admin/services/scheduleService.js
import api from './api';

// Obtener horario de una semana específica
export const fetchWeeklySchedule = (weekStartDate) =>
  api.get(`/schedules/${weekStartDate}`).then(r => r.data);

// Guardar o actualizar borrador
export const saveSchedule = (payload) =>
  api.post('/schedules', payload).then(r => r.data);

// Publicar horario
export const publishSchedule = (workScheduleId) =>
  api.patch(`/schedules/${workScheduleId}/publish`).then(r => r.data);

// Subir archivo PDF o imagen
export const uploadSchedulePdf = (workScheduleId, formData) =>
  api.post(`/schedules/${workScheduleId}/upload`, formData).then(r => r.data);

// Obtener lista de empleados activos
export const fetchEmployees = () =>
  api.get('/employees').then(r => r.data);