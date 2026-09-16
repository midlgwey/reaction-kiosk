// ScheduleModal.jsx - REFACTORIZADO
import React, { useMemo } from 'react';

const WORK_DAYS = ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const ScheduleModal = ({ employee, shifts, onClose, onSave, onChangeShift }) => {
  if (!employee) return null;

  const roleLower = employee.role?.toLowerCase().trim() || '';

  // Extraer el tipo de turno (Matutino, Vespertino, Intermedio) sin posición
  const extractShiftType = (shiftName) => {
    return shiftName
      .replace(/\s+Hostess$/i, '')
      .replace(/\s+Caja$/i, '')
      .replace(/\s+\(medio\)$/i, '')
      .trim();
  };

  // Agrupar shifts por tipo de turno
  const shiftsByType = useMemo(() => {
    const grouped = {};
    
    shifts.forEach(shift => {
      const type = extractShiftType(shift.shift_name);
 
      // Limpieza: solo Matutino genérico
      if (roleLower === 'limpieza') {
        if (shift.shift_name === 'Matutino') {
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push(shift);
        }
        return;
      }
      
      // Filtrar según el role
      const matchesRole = 
        (roleLower === 'hostess' && shift.shift_name.toLowerCase().includes('hostess')) ||
        (roleLower === 'capturista' && shift.shift_name.toLowerCase().includes('caja')) ||
        (roleLower === 'caja' && shift.shift_name.toLowerCase().includes('caja')) ||
        (!['hostess', 'capturista', 'caja'].includes(roleLower) && 
         !shift.shift_name.toLowerCase().includes('hostess') &&
         !shift.shift_name.toLowerCase().includes('caja') &&
         !shift.shift_name.toLowerCase().includes('capturista'));

      if (matchesRole) {
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push(shift);
      }
    });

    return grouped;
  }, [shifts, roleLower]);

  // Obtener tipos de turno disponibles
  const availableTypes = useMemo(() => Object.keys(shiftsByType), [shiftsByType]);

  // Obtener el turno seleccionado actualmente (asumimos que todos los días tienen el mismo tipo)
  const getCurrentShiftType = () => {
    const firstDayShift = employee.shifts?.martes;
    if (firstDayShift) {
      return extractShiftType(firstDayShift.shift_name);
    }
    return '';
  };

  // Asignar un turno a toda la semana
  const handleSelectShiftType = (shiftType) => {
    const shiftsForType = shiftsByType[shiftType];
    if (!shiftsForType || shiftsForType.length === 0) return;

    // Encontrar los shift_ids para Tue-Sat y Sunday
    const tueSatShift = shiftsForType.find(s => s.day_of_week === 'Tuesday-Saturday');
    const sundayShift = shiftsForType.find(s => s.day_of_week === 'Sunday');

    // Asignar a cada día
    WORK_DAYS.forEach((day) => {
      let selectedShift;
      
      if (day === 'domingo') {
        // El domingo usa el shift de Sunday
        selectedShift = sundayShift;
      } else {
        // Martes a sábado usan el shift de Tue-Sat
        selectedShift = tueSatShift;
      }

      if (selectedShift) {
        onChangeShift(day, {
          shift_id: selectedShift.shift_id,
          shift_name: selectedShift.shift_name,
          start_time: selectedShift.start_time,
          end_time: selectedShift.end_time
        });
      }
    });
  };

  const currentType = getCurrentShiftType();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden">

        <div className="px-6 py-4 border-b border-[#e0e0e0] bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-[#07074D] text-lg">
                Turnos de: {employee.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{employee.role}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-[#6B7280] font-medium">Selecciona un turno:</p>

          {availableTypes.length === 0 ? (
            <p className="text-center text-gray-400 py-6">No hay turnos disponibles</p>
          ) : (
            <div className="space-y-3">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleSelectShiftType(type)}
                  className={`w-full p-4 rounded-lg border-2 transition-all font-medium text-left ${
                    currentType === type
                      ? 'border-[#6A64F1] bg-indigo-50 text-[#07074D]'
                      : 'border-[#e0e0e0] bg-white text-[#6B7280] hover:border-[#6A64F1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{type}</span>
                    {currentType === type && <span className="text-[#6A64F1]">✓</span>}
                  </div>
                  
                  {/* Mostrar horarios del turno */}
                  <div className="text-xs mt-2 space-y-1">
                    {shiftsByType[type].map((shift) => (
                      <div key={shift.shift_id} className="text-[#9CA3AF]">
                        {shift.day_of_week === 'Tuesday-Saturday' 
                          ? `Mar-Sab: ${shift.start_time} - ${shift.end_time}`
                          : `Dom: ${shift.start_time} - ${shift.end_time}`
                        }
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Resumen de asignación */}
          {currentType && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-[#07074D] font-medium">
                Se asignará <strong>{currentType}</strong> a toda la semana (martes a domingo)
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#e0e0e0] flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#6A64F1] hover:bg-[#5b55e0]"
          >
            Aplicar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};