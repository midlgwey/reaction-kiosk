// frontend/src/admin/components/attendance/AttendanceRow.jsx
import React from 'react';
import { getStatusBadge, getIncidenciaText, isBlocked } from '../../../admin/utils/attendanceUtils';

export const AttendanceRow = ({ record, onMarkAttendance }) => (
  <tr className="border-b border-gray-200 hover:bg-gray-50 transition">

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
            {record.position || 'N/A'}{record.work_area ? ` • ${record.work_area}` : ''}
          </p>
        </div>
      </div>
    </td>

    {/* Entrada */}
    <td className="px-6 py-4">
      {record.check_in_time
        ? <span className="font-semibold text-gray-900">{record.check_in_time}</span>
        : <span className="text-gray-400">—</span>}
    </td>

    {/* Salida */}
    <td className="px-6 py-4">
      {record.check_out_time
        ? <span className="font-semibold text-gray-900">{record.check_out_time}</span>
        : <span className="text-gray-400">{record.check_in_time ? 'En turno' : '—'}</span>}
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
);