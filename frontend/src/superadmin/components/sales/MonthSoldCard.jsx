// frontend/src/admin/components/sales/MonthSoldCard.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPepperHot } from '@fortawesome/free-solid-svg-icons';

const MONTH_NAMES = {
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre'
};

export const MonthSoldCard = ({ 
  employees = [], 
  selectedMonth, 
  adminSales = [],
  totalMonthSold 
}) => {
  // Si no viene totalMonthSold pre-calculado, lo calculamos
  const monthSoldToDisplay = totalMonthSold !== undefined 
    ? totalMonthSold
    : employees.reduce((sum, emp) => sum + Number(emp.month_sold || 0), 0) + 
      adminSales.reduce((sum, sale) => sum + Number(sale.chiles_sold || 0), 0);

  const monthName = MONTH_NAMES[selectedMonth] || selectedMonth;

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-6 h-full flex flex-col justify-between">
      <p className="text-xs text-gray-800 uppercase tracking-wider font-bold mb-3">
        Chiles Vendidos en {monthName}
      </p>

      <div className="flex items-center justify-between my-auto py-2">
        <div>
          <p className="text-3xl font-bold text-[#07074D]">
            {monthSoldToDisplay.toLocaleString()}
          </p>
          <p className="text-xs text-slate-800 mt-1">Chiles registrados este mes</p>
        </div>

        <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faPepperHot} className="text-emerald-700 text-2xl" />
        </div>
      </div>
    </div>
  );
};