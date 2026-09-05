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