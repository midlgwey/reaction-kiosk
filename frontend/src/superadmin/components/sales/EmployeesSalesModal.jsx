// frontend/src/admin/components/sales/EmployeeSalesModal.jsx
import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const EmployeeSalesModal = ({
  isOpen,
  onClose,
  employee,
  sales,
  selectedMonth,
  monthOptions,
  onMonthChange,
  onEditSale,
  userRole
}) => {
  if (!isOpen || !employee) return null;

  const totalMonth = sales.reduce((sum, s) => sum + Number(s.chiles_sold), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e0e0e0] flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 text-[#6A64F1] flex items-center justify-center font-bold">
              {employee.first_name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-[#07074D]">{employee.first_name} {employee.last_name}</h3>
              <p className="text-xs text-gray-500">{employee.position}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        </div>

        {/* Selector de mes + resumen */}
        <div className="px-6 py-3 border-b border-[#e0e0e0] bg-indigo-50 flex items-center justify-between">
          <select
            value={selectedMonth}
            onChange={e => onMonthChange(e.target.value)}
            className="bg-transparent text-[#07074D] font-semibold text-sm border-none outline-none cursor-pointer"
          >
            {monthOptions.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <span className="text-sm font-bold text-[#07074D]">
            Total: {totalMonth} chiles
          </span>
        </div>

        {/* Lista de ventas */}
        <div className="overflow-y-auto max-h-[380px] divide-y divide-[#e0e0e0]">
          {sales.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              No hay ventas registradas este mes.
            </div>
          ) : (
            sales.map(sale => (
              <div key={sale.sale_id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div>
                  <p className="text-sm font-semibold text-[#07074D]">
                    {format(parseISO(sale.sale_date), "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                  {sale.notes && (
                    <p className="text-xs text-gray-400 mt-0.5">{sale.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-[#07074D]">
                    {sale.chiles_sold} 
                  </span>
                  <button
                    onClick={() => onEditSale(sale)}
                    className="text-xs font-semibold text-[#6A64F1] hover:underline"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e0e0e0] bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};