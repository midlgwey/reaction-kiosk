// frontend/src/superadmin/pages/SchedulePage.jsx
import React, { useState, useEffect } from 'react';
import { ScheduleHeader } from '../components/schedule/ScheduleHeader';
import { ScheduleTable } from '../components/schedule/ScheduleTable';
import { ScheduleModal } from '../components/schedule/ScheduleModal';
import { UploadPdfModal } from '../components/schedule/UploadPdfModal';
import { useSchedule } from '../../admin/hooks/schedule/useSchedule';

export const SchedulePage = () => {
  // Obtener rol del usuario actual (ej: desde tu contexto de autenticación o localStorage)
  const userRole = 'admin'; // Cambiar por tu estado global/auth real

  // Manejo de fechas (ejemplo base: fecha de inicio de semana actual - Martes)
  const [weekStartDate, setWeekStartDate] = useState('2026-09-01'); 
  const [weekEndDate, setWeekEndDate] = useState('2026-09-06');
  
  const { scheduleData, loading, getSchedule, saveWeeklySchedule, publishWeeklySchedule, uploadPdf } = useSchedule();
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editableSchedules, setEditableSchedules] = useState([]);

  // Cargar horario al cambiar de semana
  useEffect(() => {
    loadWeekData(weekStartDate);
  }, [weekStartDate]);

  const loadWeekData = async (date) => {
    try {
      const data = await getSchedule(date);
      // Mapear los datos que vienen del backend a la estructura que espera ScheduleTable
      if (data && data.assignments) {
        // Transformar asignaciones a formato por empleado
        // (Ajustar según cómo estructures tus empleados en frontend)
      }
    } catch (err) {
      // Si no existe, inicializar tabla vacía para armar borrador
      setEditableSchedules([]);
    }
  };

  const isPublished = scheduleData?.schedule?.status === 'Published';
  const workScheduleId = scheduleData?.schedule?.work_schedule_id;

  const handleSaveDraft = async () => {
    try {
      await saveWeeklySchedule({
        week_start_date: weekStartDate,
        week_end_date: weekEndDate,
        created_by: 'Admin',
        assignments: [] // Aquí pasas la matriz aplanada de turnos
      });
      alert("Borrador guardado exitosamente");
      loadWeekData(weekStartDate);
    } catch (err) {
      alert("Error al guardar borrador");
    }
  };

  const handlePublish = async () => {
    if (!workScheduleId) return;
    try {
      await publishWeeklySchedule(workScheduleId);
      alert("Horario publicado correctamente");
      loadWeekData(weekStartDate);
    } catch (err) {
      alert("Error al publicar");
    }
  };

  const handleUploadFile = async (formData) => {
    if (!workScheduleId) {
      alert("Primero debes guardar o crear el horario de esta semana para adjuntar archivos.");
      return;
    }
    try {
      await uploadPdf(workScheduleId, formData);
      setIsUploadModalOpen(false);
      alert("Archivo subido correctamente");
    } catch (err) {
      alert("Error al subir el archivo");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ScheduleHeader 
        startDate={weekStartDate}
        endDate={weekEndDate}
        onPrevWeek={() => {/* Lógica para restar 7 días a la fecha */}}
        onNextWeek={() => {/* Lógica para sumar 7 días a la fecha */}}
        isPublished={isPublished}
        userRole={userRole}
        onPublish={handlePublish}
        onSaveDraft={handleSaveDraft}
        onOpenSwapModal={() => setIsUploadModalOpen(true)}
        loading={loading}
      />

      <ScheduleTable 
        schedules={editableSchedules}
        userRole={userRole}
        isPublished={isPublished}
        onEditEmployee={(emp) => setSelectedEmployee(emp)}
      />

      <ScheduleModal 
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onChangeShift={(day, newShift) => {
          setSelectedEmployee(prev => ({
            ...prev,
            shifts: { ...prev.shifts, [day]: newShift }
          }));
        }}
        onSave={() => {
          // Actualizar en el estado general de la tabla
          setEditableSchedules(prev => 
            prev.map(emp => emp.id === selectedEmployee.id ? selectedEmployee : emp)
          );
          setSelectedEmployee(null);
        }}
      />

      <UploadPdfModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadFile}
        loading={loading}
      />
    </div>
  );
};