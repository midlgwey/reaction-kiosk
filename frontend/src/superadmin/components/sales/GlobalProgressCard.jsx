// frontend/src/admin/components/sales/GlobalProgressCard.jsx
import React from 'react';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPepperHot } from '@fortawesome/free-solid-svg-icons';

const MONTH_NAMES = {
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre'
};

export const GlobalProgressCard = ({
  globalGoal,
  globalSold,
  globalPercentage,
  teamGoal,
  elapsedWorkDays,
  totalWorkDays,
  employees = [],
  selectedMonth
}) => {
  const remainingGlobal = Math.max(globalGoal - globalSold, 0);
  const globalBarWidth = Math.min(globalPercentage, 100);

  const teamSold = globalSold;
  const teamPercentage = Math.round((teamSold / teamGoal) * 100);
  const teamBarWidth = Math.min(teamPercentage, 100);
  const remainingTeam = Math.max(teamGoal - teamSold, 0);

  const totalMonthSold = employees.reduce((sum, emp) => sum + Number(emp.month_sold || 0), 0);
  const monthName = MONTH_NAMES[selectedMonth] || selectedMonth;

  const getBarColor = (pct) => {
    if (pct >= 100) return 'bg-green-500';
    if (pct >= 90)  return 'bg-orange-400';
    if (pct >= 80)  return 'bg-blue-500';
    return 'bg-red-500';
  };

  return (
    <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Meta Global de Temporada */}
      <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#07074D] uppercase tracking-wider">
              Meta Global de Temporada
            </h2>
            <p className="text-xs text-gray-700 mt-0.5">Solo meseros y capitanes</p>
          </div>
          <span className={`text-lg font-bold ${globalPercentage >= 100 ? 'text-green-600' : 'text-[#07074D]'}`}>
            {globalPercentage}%
          </span>
        </div>
        <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getBarColor(globalPercentage)}`}
            style={{ width: `${globalBarWidth}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#07074D]">
            {globalSold.toLocaleString()} chiles vendidos
          </span>
          <span className="text-gray-700 text-md font-semibold">
            Meta: <span className="text-indigo-700 font-bold text-xl"> {globalGoal.toLocaleString()} </span>chiles
          </span>
        </div>
        <div className="mt-2 text-gray-700 text-md">
          Faltan <span className="text-indigo-700 font-bold text-xl">{remainingGlobal.toLocaleString()}</span> chiles para completar la meta global
        </div>
      </div>

      {/* Meta del Equipo Meseros */}
      <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#07074D] uppercase tracking-wider">
              Meta del Equipo Meseros
            </h2>
            <p className="text-xs text-gray-700 mt-0.5">Solo meseros y capitanes</p>
          </div>
          <span className={`text-lg font-bold ${teamPercentage >= 100 ? 'text-green-600' : 'text-[#07074D]'}`}>
            {teamPercentage}%
          </span>
        </div>
        <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getBarColor(teamPercentage)}`}
            style={{ width: `${teamBarWidth}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#07074D]">
            {teamSold.toLocaleString()} chiles vendidos
          </span>
          <span className="text-gray-700 text-md font-semibold">
            Meta: <span className="text-indigo-700 font-bold text-xl"> {teamGoal.toLocaleString()} </span>chiles
          </span>
        </div>
        <div className="mt-2 text-gray-700 text-md">
          Faltan <span className="font-semibold text-indigo-700 text-xl">{remainingTeam.toLocaleString()}</span> chiles para completar la meta del equipo
        </div>
      </div>

      {/* Fila inferior — Días hábiles + Chiles del mes */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Días hábiles */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-4">
          <div className="mb-3">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold">
              Días Hábiles del Mes (Mar — Dom)
            </p>
            <p className="text-sm text-gray-500 mt-0.5 font-semibold">
              Lunes Cerrado · Martes a Domingo Abierto
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-around">
            <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg sm:bg-transparent sm:p-0">
              <p className="text-2xl font-bold text-[#07074D]">{elapsedWorkDays}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">transcurridos</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-gray-200" />
            <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg sm:bg-transparent sm:p-0">
              <p className="text-2xl font-bold text-[#07074D]">{totalWorkDays}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">totales del mes</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-gray-200" />
            <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg sm:bg-transparent sm:p-0">
              <p className="text-2xl font-bold text-[#07074D]">{totalWorkDays - elapsedWorkDays}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">restantes</p>
            </div>
          </div>
        </div>

        {/* Chiles vendidos del mes */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold">
              Chiles Vendidos en {monthName}
            </p>
            <p className="text-3xl font-bold text-[#07074D] mt-1">
              {totalMonthSold.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">chiles registrados este mes</p>
          </div>
          <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faPepperHot} className="text-indigo-500 text-2xl" />
          </div>
        </div>

      </div>
    </div>
  );
};