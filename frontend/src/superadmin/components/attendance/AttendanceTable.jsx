// frontend/src/superadmin/components/attendance/AttendanceTable.jsx
import React, { useState, useMemo } from 'react';

export default function AttendanceTable({
  attendance,
  loading,
  onMarkAttendance
}) {
  // Estados para los filtros
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  // Orden jerárquico definido para los puestos
  const positionHierarchy = {
    'Capitan': 1,
    'Mesero': 2,
    'Ayudante de Mesero': 3,
    'Bartender': 4,
    'Hostess': 5,
    'Capturista': 6,
    'Limpieza': 7
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Presente':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Falta':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Retardo':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Incapacidad':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getIncidenciaText = (record) => {
    if (record.justification) {
      return record.justification;
    }
    if (record.status === 'Retardo') {
      return 'Llegada fuera de tiempo';
    }
    if (record.status === 'Falta') {
      return 'No se reportó';
    }
    return 'Ninguna';
  };

  const isBlocked = (status) => {
    return status === 'Falta' || status === 'Incapacidad';
  };

  // Filtrado y ordenamiento de la lista de asistencia
  const filteredAndSortedAttendance = useMemo(() => {
    if (!attendance) return [];

    // 1. Filtrar
    const filtered = attendance.filter((record) => {
      const matchesArea = selectedArea ? record.work_area === selectedArea : true;
      const matchesPosition = selectedPosition ? record.position === selectedPosition : true;
      return matchesArea && matchesPosition;
    });

    // 2. Ordenar por jerarquía de puestos
    return filtered.sort((a, b) => {
      const orderA = positionHierarchy[a.position] || 99;
      const orderB = positionHierarchy[b.position] || 99;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Si tienen el mismo puesto, ordenar alfabéticamente por nombre
      return (a.first_name || '').localeCompare(b.first_name || '');
    });
  }, [attendance, selectedArea, selectedPosition]);

  return (
    <div className="space-y-4">
      
      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 w-full">
          
          {/* Filtro por Área */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Filtrar por Área
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Todas las áreas</option>
              <option value="Comedor">Comedor</option>
              <option value="Barra">Barra</option>
              <option value="Caja">Caja</option>
            </select>
          </div>

          {/* Filtro por Puesto */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Filtrar por Puesto
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Todos los puestos</option>
              <option value="Capitan">Capitan</option>
              <option value="Mesero">Mesero</option>
              <option value="Ayudante de Mesero">Ayudante de Mesero</option>
              <option value="Bartender">Bartender</option>
              <option value="Hostess">Hostess</option>
              <option value="Capturista">Capturista</option>
              <option value="Limpieza">Limpieza</option>
            </select>
          </div>

        </div>

        {/* Botón para limpiar filtros si hay alguno activo */}
        {(selectedArea || selectedPosition) && (
          <button
            onClick={() => { setSelectedArea(''); setSelectedPosition(''); }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline self-end sm:self-center pt-2 sm:pt-0"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla Principal con Scroll Interno */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        {/* max-h-[58vh] y overflow-y-auto controlan el scroll interno vertical */}
        <div className="overflow-x-auto max-h-[58vh] overflow-y-auto">
          <table className="min-w-full text-left leading-normal relative">
            {/* sticky top-0 y bg-gray-50 aseguran que el encabezado no se pierda al hacer scroll */}
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">
                  Empleado
                </th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">
                  Entrada
                </th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">
                  Salida
                </th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">
                  Estado
                </th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">
                  Incidencias / Notas
                </th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Cargando asistencia...
                  </td>
                </tr>
              ) : filteredAndSortedAttendance.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredAndSortedAttendance.map((record) => (
                  <tr key={record.employee_id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    
                    {/* Empleado */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 text-indigo-900 font-bold text-sm flex items-center justify-center shadow-sm shrink-0">
                          {`${record.first_name?.[0] || ''}${record.last_name?.[0] || ''}`.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {record.first_name} {record.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {record.position || 'N/A'} {record.work_area ? `• ${record.work_area}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Entrada */}
                    <td className="px-6 py-4">
                      {record.check_in_time ? (
                        <span className="font-semibold text-gray-900">{record.check_in_time}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Salida */}
                    <td className="px-6 py-4">
                      {record.check_out_time ? (
                        <span className="font-semibold text-gray-900">{record.check_out_time}</span>
                      ) : (
                        <span className="text-gray-400">
                          {record.check_in_time ? 'En turno' : '—'}
                        </span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(record.status)}`}>
                        {record.status === 'Incapacidad' ? 'Incapacidad / Permiso' : record.status}
                      </span>
                    </td>

                    {/* Incidencias / Notas */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={record.justification ? 'text-orange-600 font-semibold' : 'text-gray-400'}>
                        {getIncidenciaText(record)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      {!isBlocked(record.status) ? (
                        <button
                          onClick={() => onMarkAttendance(record)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 transition hover:underline"
                        >
                          Editar / Detalle
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Bloqueado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}