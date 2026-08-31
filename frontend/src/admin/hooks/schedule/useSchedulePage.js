// frontend/src/admin/hooks/schedule/useSchedulePage.js
import { useState, useEffect, useCallback } from 'react';
import { useSchedule } from './useSchedule';
import { useExportSchedule } from '../../../superadmin/components/schedule/useExportSchedule';
import toast from 'react-hot-toast';
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Orden de aparición en la tabla — coincide con position en la BD
const ORDEN_PUESTOS = {
  "Capitan": 1, "Mesero": 2, "Ayudante de Mesero": 3,
  "Bartender": 4, "Hostess": 5, "Capturista": 6, "Limpieza": 7
};

const WORK_DAYS = ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

// Calcula el martes de la semana actual
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -5 : day === 1 ? 1 : 2 - day;
  d.setDate(d.getDate() + diff);
  return format(d, 'yyyy-MM-dd');
};

// Construye un empleado con turnos vacíos
const buildBlankEmployee = (emp) => ({
  id: emp.employee_id,
  name: `${emp.first_name} ${emp.last_name}`,
  role: emp.position || 'Operativo',
  shifts: { martes: null, miercoles: null, jueves: null, viernes: null, sabado: null, domingo: null }
});

// Ordena la lista de empleados por puesto
const sortByRole = (list) =>
  [...list].sort((a, b) => (ORDEN_PUESTOS[a.role] ?? 99) - (ORDEN_PUESTOS[b.role] ?? 99));

export const useSchedulePage = () => {
  const {
    scheduleData, loading,
    getSchedule, getEmployees, getShifts,
    saveWeeklySchedule, publishWeeklySchedule, uploadPdf
  } = useSchedule();

  const { exportToExcel } = useExportSchedule();

  const [weekStartDate, setWeekStartDate] = useState(() => getWeekStart(new Date()));
  const [shifts, setShifts] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editableSchedules, setEditableSchedules] = useState([]);

  const weekEndDate = format(addDays(parseISO(weekStartDate), 5), 'yyyy-MM-dd');
  const uploads = scheduleData?.uploads || [];
  const isPublished = scheduleData?.schedule?.status === 'Published';
  const workScheduleId = scheduleData?.schedule?.work_schedule_id;

  const formattedStart = format(parseISO(weekStartDate), 'd MMM', { locale: es });
  const formattedEnd = format(parseISO(weekEndDate), 'd MMM yyyy', { locale: es });

  // Cargar tipos de turno al montar
  useEffect(() => {
    getShifts().then(setShifts).catch(console.error);
  }, []);

  // Recargar horario cada vez que cambia la semana
  useEffect(() => {
    loadWeekData(weekStartDate);
  }, [weekStartDate]);

  const loadWeekData = useCallback(async (date) => {
    try {
      const [data, allEmployees] = await Promise.all([getSchedule(date), getEmployees()]);
      const blanks = sortByRole(allEmployees.map(buildBlankEmployee));

      if (data?.assignments?.length > 0) {
        // Construir mapa de turnos por empleado y día
        const assignmentMap = {};
        data.assignments.forEach(a => {
          if (!assignmentMap[a.employee_id]) assignmentMap[a.employee_id] = {};
          const dayName = format(parseISO(a.date), 'EEEE', { locale: es }).toLowerCase();
          const normalizedDay = dayName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          assignmentMap[a.employee_id][normalizedDay] = {
            shift_id: a.shift_id, shift_name: a.shift_name,
            start_time: a.start_time, end_time: a.end_time
          };
        });

        // Mezclar todos los empleados con sus turnos guardados
        setEditableSchedules(blanks.map(emp => ({
          ...emp,
          shifts: assignmentMap[emp.id] ? { ...emp.shifts, ...assignmentMap[emp.id] } : emp.shifts
        })));
      } else {
        setEditableSchedules(blanks);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // No existe horario — cargar empleados en blanco
        getEmployees()
          .then(all => setEditableSchedules(sortByRole(all.map(buildBlankEmployee))))
          .catch(() => setEditableSchedules([]));
      } else {
        console.error('Error al obtener horario:', err);
        setEditableSchedules([]);
      }
    }
  }, []);

  const handlePrevWeek = () =>
    setWeekStartDate(format(addDays(parseISO(weekStartDate), -7), 'yyyy-MM-dd'));

  const handleNextWeek = () =>
    setWeekStartDate(format(addDays(parseISO(weekStartDate), 7), 'yyyy-MM-dd'));

  // Convierte la tabla editable en assignments para la BD
  const handleSaveDraft = async () => {
    try {
      const assignments = [];
      editableSchedules.forEach(emp => {
        WORK_DAYS.forEach((day, index) => {
          const shift = emp.shifts[day];
          if (shift?.shift_id) {
            assignments.push({
              employee_id: emp.id,
              shift_id: shift.shift_id,
              date: format(addDays(parseISO(weekStartDate), index), 'yyyy-MM-dd')
            });
          }
        });
      });
      await saveWeeklySchedule({ week_start_date: weekStartDate, week_end_date: weekEndDate, assignments });
      toast.success('Borrador guardado correctamente');
      loadWeekData(weekStartDate);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar el borrador');
    }
  };

  // Publica el horario — después no se puede editar
  const handlePublish = async () => {
    if (!workScheduleId) {
      toast.error('Primero guarda el borrador antes de publicar');
      return;
    }
    try {
      await publishWeeklySchedule(workScheduleId);
      toast.success('Horario publicado correctamente');
      loadWeekData(weekStartDate);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al publicar el horario');
    }
  };

  // Sube un documento de permiso, cambio de turno o incapacidad
  const handleUploadFile = async (formData) => {
    if (!workScheduleId) {
      toast.error('Primero guarda el borrador antes de subir archivos');
      return;
    }
    try {
      await uploadPdf(workScheduleId, formData);
      setIsUploadModalOpen(false);
      toast.success('Documento cargado correctamente');
      loadWeekData(weekStartDate);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al subir el documento');
    }
  };

  const handleExportExcel = () => {
    const result = exportToExcel(editableSchedules, formattedStart, formattedEnd);
    if (!result.success) toast.error(result.error || 'Error al exportar');
  };

  const handleChangeShift = (day, newShift) =>
    setSelectedEmployee(prev => ({ ...prev, shifts: { ...prev.shifts, [day]: newShift } }));

  const handleSaveModal = () => {
    setEditableSchedules(prev =>
      prev.map(emp => emp.id === selectedEmployee.id ? selectedEmployee : emp)
    );
    setSelectedEmployee(null);
  };

  return {
    // Estado
    shifts,
    uploads,
    loading,
    isPublished,
    editableSchedules,
    selectedEmployee,
    isUploadModalOpen,
    formattedStart,
    formattedEnd,
    // Setters
    setSelectedEmployee,
    setIsUploadModalOpen,
    // Handlers
    handlePrevWeek,
    handleNextWeek,
    handleSaveDraft,
    handlePublish,
    handleUploadFile,
    handleExportExcel,
    handleChangeShift,
    handleSaveModal
  };
};