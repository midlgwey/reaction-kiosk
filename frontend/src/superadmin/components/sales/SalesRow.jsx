// frontend/src/admin/components/sales/SalesRow.jsx
import React from 'react';
import { STATUS_CONFIG, BAR_COLOR } from '../../../admin/utils/salesUtils';

export const SalesRow = ({ emp, userRole, onViewEmployee }) => {
  const status   = STATUS_CONFIG[emp.status] || STATUS_CONFIG.red;
  const barColor = BAR_COLOR[emp.status]     || 'bg-red-500';
  const barWidth = Math.min(emp.percentage, 100);

  return (
    <tr className="border-b border-[#e0e0e0] hover:bg-gray-50/50 transition-colors">

      {/* Colaborador */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-100 text-indigo-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {emp.first_name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-[#07074D]">{emp.first_name} {emp.last_name}</p>
            <p className="text-xs text-[#6B7280]">{emp.position}</p>
          </div>
        </div>
      </td>

      {/* Semáforo */}
      <td className="px-6 py-4">
        <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </td>

      {/* Meta mensual */}
      <td className="px-6 py-4 text-sm font-semibold text-[#07074D]">
        {emp.monthly_goal} chiles
      </td>

      {/* Progreso */}
      <td className="px-6 py-4">
        <div className="w-full max-w-[160px]">
          <div className="flex justify-between mb-1 text-xs font-semibold text-gray-600">
            <span>{emp.month_sold} / {emp.monthly_goal}</span>
            <span>{emp.percentage}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
      </td>

      {/* Esperado hoy */}
      <td className="px-6 py-4 text-sm text-[#6B7280]">
        {emp.expected_today} chiles
      </td>

      {/* Acciones */}
      <td className="px-6 py-4 text-center">
        {userRole !== 'operativo' ? (
          <button
            onClick={() => onViewEmployee(emp)}
            className="text-xs font-semibold text-[#6A64F1] hover:text-[#5b55e0] hover:underline transition"
          >
            Ver historial
          </button>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

    </tr>
  );
};