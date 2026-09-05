// frontend/src/admin/components/sales/MonthSoldCard.jsx
import React from 'react';

const MONTH_NAMES = {
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre'
};

export const MonthSoldCard = ({ employees = [], selectedMonth }) => {
  const totalMonthSold = employees.reduce((sum, emp) => sum + Number(emp.month_sold || 0), 0);
  const monthName = MONTH_NAMES[selectedMonth] || selectedMonth;

  return (
    <div className="mb-6 bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wider font-bold">
            Chiles Vendidos en {monthName}
          </p>
          <p className="text-3xl font-bold text-[#07074D] mt-1">
            {totalMonthSold.toLocaleString()}
            <span className="text-sm font-normal text-gray-500 ml-2">chiles este mes</span>
          </p>
        </div>
        <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};