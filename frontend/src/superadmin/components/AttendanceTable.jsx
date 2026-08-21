import React, { useState } from 'react';

const INITIAL_MOCK_DATA = [
  {
    id: 1,
    name: 'Vera Carpenter',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
    timeIn: '08:00 AM',
    timeOut: '05:00 PM',
    status: 'Presente',
    incident: 'Ninguna'
  },
  {
    id: 2,
    name: 'Blake Bowman',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
    timeIn: '08:45 AM',
    timeOut: 'En turno',
    status: 'Retardo',
    incident: 'Tráfico en la ruta principal'
  },
  {
    id: 3,
    name: 'Dana Moore',
    avatar: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
    timeIn: '-',
    timeOut: '-',
    status: 'Falta',
    incident: 'No se reportó'
  },
  {
    id: 4,
    name: 'Alonzo Cox',
    avatar: 'https://images.unsplash.com/photo-1522609925277-66fea332c575?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&h=160&w=160&q=80',
    timeIn: '-',
    timeOut: '-',
    status: 'Incapacidad',
    incident: 'Cita médica (Justificante IMSS)'
  },
];

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState('2026-08-21');
  const [records, setRecords] = useState(INITIAL_MOCK_DATA);
  const [editingUser, setEditingUser] = useState(null);

  const dateObj = new Date(`${selectedDate}T00:00:00`);
  const isMonday = dateObj.getDay() === 1;

  const changeDay = (daysToAdd) => {
    const newDate = new Date(dateObj);
    newDate.setDate(newDate.getDate() + daysToAdd);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Presente': return 'bg-green-100 text-green-700 border-green-200';
      case 'Retardo': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Falta': return 'bg-red-100 text-red-700 border-red-200';
      case 'Incapacidad': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Contadores dinámicos según el estado actual
  const stats = {
    presentes: records.filter(r => r.status === 'Presente').length,
    retardos: records.filter(r => r.status === 'Retardo').length,
    faltas: records.filter(r => r.status === 'Falta').length,
    incapacidades: records.filter(r => r.status === 'Incapacidad').length,
  };

  // Guardar cambios del modal
  const handleSaveModal = (e) => {
    e.preventDefault();
    setRecords(records.map(r => r.id === editingUser.id ? editingUser : r));
    setEditingUser(null);
  };

  return (
    <div className="w-full font-sans antialiased p-6 relative">
      
      {/* 1. CABECERA Y NAVEGADOR DE FECHAS */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07074D]">Registro de Asistencia</h1>
          <p className="text-[#6B7280]">Consulta y gestiona entradas, salidas e incidencias.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-[#e0e0e0] shadow-sm">
          <button 
            onClick={() => changeDay(-1)}
            className="p-2 hover:bg-gray-100 rounded-md text-[#6B7280] transition-colors"
            title="Día anterior"
          >
            &larr;
          </button>
          
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none bg-transparent text-[#07074D] font-medium outline-none cursor-pointer"
          />
          
          <button 
            onClick={() => changeDay(1)}
            className="p-2 hover:bg-gray-100 rounded-md text-[#6B7280] transition-colors"
            title="Día siguiente"
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* 2. PANTALLA SI ES LUNES */}
      {isMonday ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h2 className="text-xl font-bold text-[#07074D]">Día de Descanso</h2>
          <p className="text-[#6B7280] mt-2 text-center max-w-md">
            El restaurante permanece cerrado los lunes. No hay registros de asistencia ni incidencias para este día.
          </p>
        </div>
      ) : (
        
       
        <>
      
          {/* Tarjetas de Resumen Dinámicas */}
          <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
            <div className="bg-white p-4 rounded-xl border border-[#e0e0e0] shadow-sm border-l-4 border-l-green-500">
              <p className="text-sm text-[#6B7280] font-medium">Presentes</p>
              <p className="text-2xl font-bold text-[#07074D]">{stats.presentes}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#e0e0e0] shadow-sm border-l-4 border-l-orange-500">
              <p className="text-sm text-[#6B7280] font-medium">Retardos</p>
              <p className="text-2xl font-bold text-[#07074D]">{stats.retardos}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#e0e0e0] shadow-sm border-l-4 border-l-red-500">
              <p className="text-sm text-[#6B7280] font-medium">Faltas</p>
              <p className="text-2xl font-bold text-[#07074D]">{stats.faltas}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#e0e0e0] shadow-sm border-l-4 border-l-blue-500">
              <p className="text-sm text-[#6B7280] font-medium">Incapacidades</p>
              <p className="text-2xl font-bold text-[#07074D]">{stats.incapacidades}</p>
            </div>
          </div>

          

          {/* Tabla de Registros */}
          <div className="overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left leading-normal">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#e0e0e0]">
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Empleado</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Entrada</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Salida</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Estatus</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Incidencias / Notas</th>
                    <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D] text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((user) => (
                    <tr key={user.id} className="border-b border-[#e0e0e0] transition-colors hover:bg-gray-50/50">
                      
                      {/* Empleado */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img className="h-8 w-8 rounded-full object-cover" src={user.avatar} alt={user.name} />
                          <p className="font-medium text-[#07074D]">{user.name}</p>
                        </div>
                      </td>
                      
                      {/* Entrada / Salida */}
                      <td className="px-6 py-4 font-mono text-sm text-[#6B7280]">{user.timeIn}</td>
                      <td className="px-6 py-4 font-mono text-sm text-[#6B7280]">{user.timeOut}</td>
                      
                      {/* Estatus */}
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(user.status)}`}>
                          {user.status}
                        </span>
                      </td>

                      {/* Notas de Incidencia */}
                      <td className="px-6 py-4">
                        <p className={`text-sm ${user.incident !== 'Ninguna' ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                          {user.incident}
                        </p>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setEditingUser({ ...user })}
                          className="text-[#6A64F1] hover:text-[#5b55e0] font-medium text-sm underline decoration-transparent hover:decoration-current transition-all"
                        >
                          Editar / Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 4. MODAL DE EDICIÓN EXCLUSIVO PARA EL GERENTE */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-[#e0e0e0] flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <img className="h-10 w-10 rounded-full object-cover" src={editingUser.avatar} alt={editingUser.name} />
                <div>
                  <h3 className="font-bold text-[#07074D] text-lg">{editingUser.name}</h3>
                  <p className="text-xs text-[#6B7280]">Ajuste manual de asistencia</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#07074D] uppercase mb-1">Hora Entrada</label>
                  <input 
                    type="text" 
                    value={editingUser.timeIn}
                    onChange={(e) => setEditingUser({ ...editingUser, timeIn: e.target.value })}
                    className="w-full border border-[#e0e0e0] rounded-lg p-2.5 text-sm text-[#07074D] focus:border-[#6A64F1] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#07074D] uppercase mb-1">Hora Salida</label>
                  <input 
                    type="text" 
                    value={editingUser.timeOut}
                    onChange={(e) => setEditingUser({ ...editingUser, timeOut: e.target.value })}
                    className="w-full border border-[#e0e0e0] rounded-lg p-2.5 text-sm text-[#07074D] focus:border-[#6A64F1] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#07074D] uppercase mb-1">Estatus del Día</label>
                <select 
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="w-full border border-[#e0e0e0] rounded-lg p-2.5 text-sm text-[#07074D] focus:border-[#6A64F1] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Presente">Presente</option>
                  <option value="Retardo">Retardo</option>
                  <option value="Falta">Falta</option>
                  <option value="Incapacidad">Incapacidad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#07074D] uppercase mb-1">Incidencia / Notas</label>
                <textarea 
                  rows="3"
                  value={editingUser.incident}
                  onChange={(e) => setEditingUser({ ...editingUser, incident: e.target.value })}
                  placeholder="Escribe la razón o justificante..."
                  className="w-full border border-[#e0e0e0] rounded-lg p-2.5 text-sm text-[#07074D] focus:border-[#6A64F1] focus:outline-none resize-none"
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#6A64F1] hover:bg-[#5b55e0] transition-colors shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}