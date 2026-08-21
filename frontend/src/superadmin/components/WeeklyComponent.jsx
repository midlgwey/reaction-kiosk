import React, { useState } from 'react';

// Opciones de turno basadas en las reglas del restaurante
const SHIFT_OPTIONS = {
  REGULAR: ['7:00 AM - 3:00 PM', '2:00 PM - 10:00 PM', 'Descanso'],
  SUNDAY: ['7:00 AM - 3:00 PM', '10:30 AM - 6:30 PM', 'Descanso']
};

const INITIAL_SCHEDULES = [
  {
    id: 1,
    name: 'Black Bowman',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
    role: 'Mesero',
    shifts: {
      martes: '7:00 AM - 3:00 PM',
      miercoles: '7:00 AM - 3:00 PM',
      jueves: 'Descanso',
      viernes: '2:00 PM - 10:00 PM',
      sabado: '2:00 PM - 10:00 PM',
      domingo: '10:30 AM - 6:30 PM',
    }
  },
  {
    id: 2,
    name: 'Vera Carpenter',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
    role: 'Mesera',
    shifts: {
      martes: '2:00 PM - 10:00 PM',
      miercoles: '2:00 PM - 10:00 PM',
      jueves: '2:00 PM - 10:00 PM',
      viernes: '7:00 AM - 3:00 PM',
      sabado: 'Descanso',
      domingo: '7:00 AM - 3:00 PM',
    }
  },

    {   
    id: 3,
    name: 'Dana Moore',
    avatar: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',        
    role: 'Mesera',
    shifts: {
      martes: '2:00 PM - 10:00 PM',
      miercoles: '2:00 PM - 10:00 PM',
      jueves: '2:00 PM - 10:00 PM',
      viernes: '7:00 AM - 3:00 PM',
      sabado: 'Descanso',
      domingo: '7:00 AM - 3:00 PM',
    }
},

];

// Días de la semana operativa (Martes a Domingo)
const WORK_DAYS = ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export default function WeeklySchedulePage() {
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Para fines de la demostración estética, simulamos que hoy es Viernes.
  // En producción, esto se calcula con new Date()
  const currentDayIndex = 3; // 0=Mar, 1=Mie, 2=Jue, 3=Vie (Hoy), 4=Sab, 5=Dom

  const handleSaveModal = (e) => {
    e.preventDefault();
    setSchedules(schedules.map(emp => emp.id === editingEmployee.id ? editingEmployee : emp));
    setEditingEmployee(null);
  };

  // Helper para renderizar la celda de cada día
  const renderDayCell = (day, index, shift) => {
    const isPast = index < currentDayIndex;
    const isToday = index === currentDayIndex;
    const isOff = shift === 'Descanso';

    return (
      <td key={day} className={`px-4 py-4 text-center border-l border-[#e0e0e0] ${isPast ? 'bg-green-50/40' : ''}`}>
        <div className="flex flex-col items-center justify-center gap-1">
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
            isOff 
              ? 'text-gray-400 bg-gray-100' 
              : isPast 
                ? 'text-green-700 bg-green-100'
                : isToday
                  ? 'text-[#6A64F1] bg-indigo-50 border border-[#6A64F1]/30'
                  : 'text-[#07074D] bg-gray-50'
          }`}>
            {shift}
          </span>
          {isPast && !isOff && (
            <svg className="w-3 h-3 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </td>
    );
  };

  return (
    <div className="w-full font-sans antialiased p-6">
      
     {/* 1. CABECERA: LEYENDA, NAVEGACIÓN Y EXPORTACIÓN */}
<div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-[#07074D]">Horarios Semanales</h1>
    <p className="text-[#6B7280]">Planificación de turnos del personal.</p>
  </div>

  <div className="flex flex-col sm:flex-row items-center gap-4">
    {/* Controles de Viaje en el tiempo */}
    <div className="flex items-center bg-white p-1.5 rounded-lg border border-[#e0e0e0] shadow-sm">
      <button className="p-2 hover:bg-gray-100 rounded-md text-[#6B7280] transition-colors">
        &larr;
      </button>
      <div className="flex flex-col items-center px-4">
        <span className="text-[#07074D] font-bold text-sm uppercase tracking-wide">
          Mar 18 - Dom 23
        </span>
        <span className="text-[#6B7280] text-xs font-medium">
          Agosto 2026
        </span>
      </div>
      <button className="p-2 hover:bg-gray-100 rounded-md text-[#6B7280] transition-colors">
        &rarr;
      </button>
    </div>

    {/* Botones de Exportación para WhatsApp/Excel */}
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-2 bg-white border border-[#e0e0e0] text-[#07074D] px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm text-sm">
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
        Excel
      </button>
      <button className="flex items-center gap-2 bg-[#6A64F1] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#5b55e0] transition-colors shadow-sm text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        PDF / Compartir
      </button>
    </div>
  </div>
</div>
      {/* 2. TABLA DE HORARIOS (Matriz) */}
      <div className="overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left leading-normal">
            <thead>
              <tr className="bg-gray-50 border-b border-[#e0e0e0]">
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D] min-w-[200px]">
                  Empleado
                </th>
                {WORK_DAYS.map((day, index) => (
                  <th key={day} className={`px-4 py-4 text-xs font-semibold uppercase tracking-wider text-center border-l border-[#e0e0e0] ${index === currentDayIndex ? 'text-[#6A64F1]' : 'text-[#6B7280]'}`}>
                    {day}
                    {index === currentDayIndex && <span className="block text-[10px] text-[#6A64F1] mt-1">(Hoy)</span>}
                  </th>
                ))}
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D] text-center border-l border-[#e0e0e0]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((emp) => (
                <tr key={emp.id} className="border-b border-[#e0e0e0] transition-colors hover:bg-gray-50/50">
                  
                  {/* Empleado */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img className="h-10 w-10 rounded-full object-cover shadow-sm" src={emp.avatar} alt={emp.name} />
                      <div>
                        <p className="font-medium text-[#07074D]">{emp.name}</p>
                        <p className="text-xs text-[#6B7280]">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Días de la semana */}
                  {WORK_DAYS.map((day, index) => renderDayCell(day, index, emp.shifts[day]))}

                  {/* Acciones */}
                  <td className="px-6 py-4 text-center border-l border-[#e0e0e0]">
                    <button 
                      onClick={() => setEditingEmployee({ ...emp })}
                      className="text-[#6A64F1] hover:text-[#5b55e0] font-medium text-sm underline decoration-transparent hover:decoration-current transition-all"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL DE EDICIÓN RÁPIDA */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-[#e0e0e0] flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <img className="h-10 w-10 rounded-full object-cover" src={editingEmployee.avatar} alt={editingEmployee.name} />
                <div>
                  <h3 className="font-bold text-[#07074D] text-lg">{editingEmployee.name}</h3>
                  <p className="text-xs text-[#6B7280]">Modificar horario semanal</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingEmployee(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Formulario de Turnos */}
            <form onSubmit={handleSaveModal} className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {WORK_DAYS.map((day) => (
                  <div key={day} className="bg-gray-50 p-3 rounded-lg border border-[#e0e0e0]">
                    <label className="block text-xs font-bold text-[#07074D] uppercase mb-2 capitalize">
                      {day}
                    </label>
                    <select 
                      value={editingEmployee.shifts[day]}
                      onChange={(e) => setEditingEmployee({
                        ...editingEmployee,
                        shifts: { ...editingEmployee.shifts, [day]: e.target.value }
                      })}
                      className="w-full border border-[#e0e0e0] rounded-md p-2 text-xs text-[#6B7280] focus:border-[#6A64F1] focus:outline-none bg-white cursor-pointer"
                    >
                      {/* Lógica para mostrar los turnos correctos si es domingo */}
                      {(day === 'domingo' ? SHIFT_OPTIONS.SUNDAY : SHIFT_OPTIONS.REGULAR).map(shift => (
                        <option key={shift} value={shift}>{shift}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Botones de acción */}
              <div className="pt-4 border-t border-[#e0e0e0] flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#6A64F1] hover:bg-[#5b55e0] transition-colors shadow-sm"
                >
                  Guardar Horario
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}