// frontend/src/superadmin/components/attendance/AttendanceModal.jsx
import React, { useState, useEffect } from 'react';

export default function AttendanceModal({
  isOpen,
  onClose,
  onSave,
  employee,
  isLoading
}) {
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [status, setStatus] = useState('Presente');
  const [justification, setJustification] = useState('');

  useEffect(() => {
    if (isOpen && employee) {
      setCheckInTime(employee.check_in_time || '');
      setCheckOutTime(employee.check_out_time || '');
      setStatus(employee.status || 'Presente');
      setJustification(employee.justification || '');
    }
  }, [isOpen, employee]);

  const isBlocked = status === 'Falta' || status === 'Incapacidad';

  // Limpiar horas automáticamente si se cambia a un estado de ausencia
  useEffect(() => {
    if (isBlocked) {
      setCheckInTime('');
      setCheckOutTime('');
    }
  }, [status]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const handleSave = () => {
    const data = {
      employeeId: employee?.employee_id,
      // Si está bloqueado, enviamos null explícitamente para limpiar las horas en la BD
      checkInTime: isBlocked ? null : (checkInTime || null),
      checkOutTime: isBlocked ? null : (checkOutTime || null),
      status,
      justification: justification || null
    };
    onSave(data);
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Cabecera con foto y nombre */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
              {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-xs text-gray-500">Ajuste manual de asistencia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <div className="space-y-4 mb-6">
          
          {/* Hora Entrada */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Hora Entrada
            </label>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              disabled={isBlocked}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
          </div>

          {/* Hora Salida */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Hora Salida
            </label>
            <input
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              disabled={isBlocked}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
          </div>

          {/* Estado del Día */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Estado del Día
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            >
              <option value="Presente">Presente</option>
              <option value="Retardo">Retardo</option>
              <option value="Falta">Falta</option>
              <option value="Incapacidad">Incapacidad / Permiso</option>
            </select>
          </div>

          {/* Incidencia / Notas - OPCIONAL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Incidencia / Notas <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Ninguna"
              rows="3"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none"
            />
          </div>

          {/* Aviso si está bloqueado */}
          {isBlocked && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-semibold">
                ⚠️ Una vez marcado como {status === 'Incapacidad' ? 'Incapacidad / Permiso' : 'Falta'}, las horas de entrada y salida se deshabilitarán.
              </p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}