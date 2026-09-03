// ScheduleTable.jsx
import React from 'react';

const WORK_DAYS = ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const ScheduleTable = ({ schedules, userRole, isPublished, onEditEmployee }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-lg ">
      <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
        <table className="min-w-full text-left leading-normal">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-[#e0e0e0]">
              <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D] min-w-[200px]">
                Empleado
              </th>
              {WORK_DAYS.map((day) => (
                <th key={day} className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-center border-l border-[#e0e0e0] text-[#6B7280]">
                  {day}
                </th>
              ))}
              {userRole === 'admin' && !isPublished && (
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D] text-center border-l border-[#e0e0e0]">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                  No hay horarios para esta semana.
                </td>
              </tr>
            ) : (
              schedules.map((emp) => (
                <tr key={emp.id} className="border-b border-[#e0e0e0] transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-100 text-indigo-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[#07074D]">{emp.name}</p>
                        <p className="text-xs text-[#6B7280]">{emp.role}</p>
                      </div>
                    </div>
                  </td>

                  {WORK_DAYS.map((day) => {
                    const shift = emp.shifts?.[day];
                    const isOff = !shift;
                    return (
                      <td key={day} className="px-4 py-4 text-center border-l border-[#e0e0e0]">
                        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-md ${
                          isOff
                            ? 'text-gray-400 bg-gray-100'
                            : 'text-[#07074D] bg-indigo-50 border border-indigo-100'
                        }`}>
                          {isOff ? 'Descanso' : `${shift.shift_name} (${shift.start_time})`}
                        </span>
                      </td>
                    );
                  })}

                  {userRole === 'admin' && !isPublished && (
                    <td className="px-6 py-4 text-center border-l border-[#e0e0e0]">
                      <button
                        onClick={() => onEditEmployee(emp)}
                        className="text-[#6A64F1] hover:text-[#5b55e0] font-medium text-sm underline transition-all"
                      >
                        Editar
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};