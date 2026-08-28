// frontend/src/admin/components/sales/SalesTable.jsx
import React, { useState } from 'react';

const STATUS_CONFIG = {
  green:  { label: '● Al corriente',       className: 'bg-green-100 text-green-700 border-green-200' },
  orange: { label: '● Ligeramente atrás',  className: 'bg-orange-100 text-orange-700 border-orange-200' },
  blue:   { label: '● Atrasado',           className: 'bg-blue-100 text-blue-700 border-blue-200' },
  red:    { label: '● Atención urgente',   className: 'bg-red-100 text-red-700 border-red-200' },
};

const BAR_COLOR = {
  green:  'bg-green-500',
  orange: 'bg-orange-400',
  blue:   'bg-blue-500',
  red:    'bg-red-500',
};

export const SalesTable = ({ employees, userRole, onViewEmployee, onEditSale }) => {
  const [search, setSearch] = useState('');

  const filtered = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-lg">

      {/* Cabecera tabla */}
      <div className="px-6 py-4 border-b border-[#e0e0e0] bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#07074D] uppercase tracking-wider">
            👥 Rendimiento Individual
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Meseros y capitanes — semáforo actualizado al día de hoy</p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar colaborador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#e0e0e0] bg-white py-2 pl-9 pr-4 text-sm text-[#6B7280] focus:border-[#6A64F1] focus:outline-none"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
        <table className="min-w-full text-left leading-normal">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-[#e0e0e0]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#07074D]">Colaborador</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#07074D]">Semáforo</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#07074D]">Meta Mensual</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#07074D]">Progreso del Mes</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#07074D]">Esperado Hoy</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#07074D] text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                  No se encontraron colaboradores.
                </td>
              </tr>
            ) : (
              filtered.map(emp => {
                const status = STATUS_CONFIG[emp.status] || STATUS_CONFIG.red;
                const barColor = BAR_COLOR[emp.status] || 'bg-red-500';
                const barWidth = Math.min(emp.percentage, 100);

                return (
                  <tr key={emp.employee_id} className="border-b border-[#e0e0e0] hover:bg-gray-50/50 transition-colors">

                    {/* Colaborador */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-[#6A64F1] flex items-center justify-center font-bold text-sm flex-shrink-0">
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
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => onViewEmployee(emp)}
                          className="text-xs font-semibold text-[#6A64F1] hover:text-[#5b55e0] hover:underline transition"
                        >
                          Ver historial
                        </button>
                        <button
                          onClick={() => onEditSale({ employee_id: emp.employee_id, name: `${emp.first_name} ${emp.last_name}` })}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-800 hover:underline transition"
                        >
                          Registrar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};