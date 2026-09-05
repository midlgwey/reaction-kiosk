// frontend/src/admin/components/attendance/AttendanceTable.jsx
import React from 'react';
import { ChartLoading } from '../../../admin/components/ui/ChartLoading';
import { useAttendanceTable } from '../../../admin/hooks/attendance/useAttendanceTable';
import { AttendanceFilters } from './AttendanceFilters';
import { AttendanceRow } from './AttendanceRow';


export default function AttendanceTable({ attendance, loading, onMarkAttendance }) {
  const {
    selectedArea,     setSelectedArea,
    selectedPosition, setSelectedPosition,
    hasActiveFilters, handleClearFilters,
    filteredAndSortedAttendance,
  } = useAttendanceTable(attendance);

  return (
    <div className="space-y-4">

      {/* Filtros */}
      <AttendanceFilters
        selectedArea={selectedArea}         setSelectedArea={setSelectedArea}
        selectedPosition={selectedPosition} setSelectedPosition={setSelectedPosition}
        hasActiveFilters={hasActiveFilters}  onClearFilters={handleClearFilters}
      />

      {/* Tabla Principal con Scroll Interno */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        {/* max-h-[58vh] y overflow-y-auto controlan el scroll interno vertical */}
        <div className="overflow-x-auto max-h-[58vh] overflow-y-auto">
          <table className="min-w-full text-left leading-normal relative">
            {/* sticky top-0 y bg-gray-50 aseguran que el encabezado no se pierda al hacer scroll */}
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Empleado</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Entrada</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Salida</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Estado</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Incidencias / Notas</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                /* Loading */
                <tr>
                  <td colSpan={6} className="py-6 px-4">
                    <ChartLoading />
                  </td>
                </tr>
              ) : filteredAndSortedAttendance.length === 0 ? (
                /* Sin resultados */
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                /* Filas de asistencia */
                filteredAndSortedAttendance.map((record) => (
                  <AttendanceRow
                    key={record.employee_id}
                    record={record}
                    onMarkAttendance={onMarkAttendance}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}