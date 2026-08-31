// ScheduleModal.jsx 
import React from 'react';

const WORK_DAYS = ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const ScheduleModal = ({ employee, shifts, onClose, onSave, onChangeShift }) => {
  if (!employee) return null;

  // Filtrar turnos según si es domingo o no
  const getShiftsForDay = (day) => {
    if (day === 'domingo') {
      return shifts.filter(s => s.day_of_week === 'Sunday');
    }
    return shifts.filter(s => s.day_of_week === 'Tuesday-Saturday');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden">

        <div className="px-6 py-4 border-b border-[#e0e0e0] flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-[#07074D] text-lg">
            Turnos de: {employee.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
            &times;
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {WORK_DAYS.map((day) => {
            const dayShifts = getShiftsForDay(day);
            const currentShift = employee.shifts[day];

            return (
              <div key={day} className="bg-gray-50 p-3 rounded-lg border border-[#e0e0e0]">
                <label className="block text-xs font-bold text-[#07074D] uppercase mb-2 capitalize">
                  {day}
                </label>
                <select
                  value={currentShift?.shift_id || ''}
                  onChange={(e) => {
                    const selected = dayShifts.find(s => s.shift_id === Number(e.target.value));
                    onChangeShift(day, selected ? {
                      shift_id: selected.shift_id,
                      shift_name: selected.shift_name,
                      start_time: selected.start_time,
                      end_time: selected.end_time
                    } : null);
                  }}
                  className="w-full border border-[#e0e0e0] rounded-md p-2 text-xs text-[#6B7280] focus:border-[#6A64F1] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="">Descanso</option>
                  {dayShifts.map(shift => (
                    <option key={shift.shift_id} value={shift.shift_id}>
                      {shift.shift_name} ({shift.start_time} - {shift.end_time})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
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