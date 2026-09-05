// frontend/src/admin/components/sales/SalesTable.jsx
import React, { useState } from 'react';
import { SalesRow } from './SalesRow';
import { ChartLoading } from '../../../admin/components/ui/ChartLoading';

export const SalesTable = ({ employees, userRole, onViewEmployee, loading }) => {
  const [search, setSearch] = useState('');

  const filtered = (employees || []).filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-lg">

      {/* Cabecera tabla */}
      <div className="px-6 py-4 border-b border-[#e0e0e0] bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#07074D] uppercase tracking-wider">
            Rendimiento Individual
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Meseros y capitanes — semáforo actualizado al día de hoy
          </p>
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
            {loading ? (
              /* Loading */
              <tr>
                <td colSpan={6} className="py-6 px-4">
                  <ChartLoading />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              /* Sin resultados */
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                  No se encontraron colaboradores.
                </td>
              </tr>
            ) : (
              /* Filas */
              filtered.map(emp => (
                <SalesRow
                  key={emp.employee_id}
                  emp={emp}
                  userRole={userRole}
                  onViewEmployee={onViewEmployee}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};