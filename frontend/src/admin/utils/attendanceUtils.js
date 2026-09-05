// frontend/src/admin/utils/attendanceUtils.js

// Orden jerárquico definido para los puestos del restaurante
export const positionHierarchy = {
  'Capitan': 1,
  'Mesero': 2,
  'Ayudante de Mesero': 3,
  'Bartender': 4,
  'Hostess': 5,
  'Capturista': 6,
  'Limpieza': 7
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'Presente':    return 'bg-green-100 text-green-700 border-green-200';
    case 'Falta':       return 'bg-red-100 text-red-700 border-red-200';
    case 'Retardo':     return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Incapacidad': return 'bg-blue-100 text-blue-700 border-blue-200';
    default:            return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const getIncidenciaText = (record) => {
  if (record.justification) return record.justification;
  if (record.status === 'Retardo')  return 'Llegada fuera de tiempo';
  if (record.status === 'Falta')    return 'No se reportó';
  return 'Ninguna';
};

export const isBlocked = (status) =>
  status === 'Falta' || status === 'Incapacidad';

// Combina la lista de empleados activos con sus registros de asistencia del día
export const mergeAttendanceWithEmployees = (employees, attendance) =>
  employees
    .filter(emp => emp.status === 'Active')
    .map(emp => {
      const record = attendance.find(a => a.employee_id === emp.employee_id);
      return {
        attendance_id:   record?.attendance_id  ?? null,
        employee_id:     emp.employee_id,
        first_name:      emp.first_name,
        last_name:       emp.last_name,
        position:        emp.position,
        work_area:       emp.work_area,
        check_in_time:   record?.check_in_time  ?? null,
        check_out_time:  record?.check_out_time ?? null,
        shift_name:      record?.shift_name     ?? null,
        status:          record?.status         ?? 'Presente',
        justification:   record?.justification  ?? null,
      };
    });