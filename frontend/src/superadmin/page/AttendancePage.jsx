// AttendancePage.jsx 
import React, { useState, useEffect } from 'react';
import AttendanceTable from '../components/attendance/AttendanceTable';
import AttendanceModal from '../components/attendance/AttendanceModal';
import { useAttendance } from '../../admin/hooks/attendance/useAttendance';
import { useEmployees } from '../../admin/hooks/employees/useEmployees';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const {
    attendance,
    loading,
    error,
    fetchShifts,
    fetchAttendanceByDate,
    updateRecord
  } = useAttendance();

  const { employees, fetchEmployees } = useEmployees();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar turnos y empleados al montar
  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, [fetchShifts, fetchEmployees]);

  // Cargar asistencia del día seleccionado
  useEffect(() => {
    fetchAttendanceByDate(selectedDate);
  }, [selectedDate, fetchAttendanceByDate]);

  // Combinar empleados activos con asistencia del día
  const attendanceWithAllEmployees = employees
    .filter(emp => emp.status === 'Active')
    .map(emp => {
      const attendanceRecord = attendance.find(a => a.employee_id === emp.employee_id);
      return {
        attendance_id: attendanceRecord?.attendance_id,
        employee_id: emp.employee_id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        position: emp.position,
        work_area: emp.work_area,
        check_in_time: attendanceRecord?.check_in_time || null,
        check_out_time: attendanceRecord?.check_out_time || null,
        shift_name: attendanceRecord?.shift_name || null,
        status: attendanceRecord?.status || 'Presente',
        justification: attendanceRecord?.justification || null
      };
    });

  const handleOpenModal = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSaveAttendance = async (data) => {
    setIsSaving(true);
    try {
      const result = await updateRecord(data.employeeId, selectedDate, {
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        status: data.status,
        justification: data.justification
      });

      if (!result.success) throw new Error(result.error);

      toast.success('Cambios guardados correctamente');
      handleCloseModal();
      fetchAttendanceByDate(selectedDate);
    } catch (err) {
      toast.error(err.message || 'Error al guardar cambios');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Encabezado */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight border-l-4 border-indigo-600 pl-4">
              Control de Asistencia
            </h1>
            <p className="text-sm mt-2 text-gray-500">
              Registro de entrada, salida y justificaciones
            </p>
          </div>

          {/* Selector de fecha */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase">Seleccionar fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Fecha formateada */}
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-sm font-semibold text-indigo-900">
            📅 {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, d MMMM yyyy', { locale: es })}
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabla de asistencia */}
        <AttendanceTable
          attendance={attendanceWithAllEmployees}
          loading={loading}
          onMarkAttendance={handleOpenModal}
        />

        {/* Modal */}
        <AttendanceModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveAttendance}
          employee={selectedEmployee}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}