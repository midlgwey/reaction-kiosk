// frontend/src/admin/components/sales/GlobalProgressCard.jsx
import React from 'react';

export const GlobalProgressCard = ({
  globalGoal,
  globalSold,
  globalPercentage,
  teamGoal,
  elapsedWorkDays,
  totalWorkDays
}) => {
  const remainingGlobal = Math.max(globalGoal - globalSold, 0);
  const globalBarWidth = Math.min(globalPercentage, 100);

  // Calcular progreso del equipo meseros
  // El team_sold es el mismo global_sold ya que los chiles los registran meseros y capitanes
  const teamSold = globalSold;
  const teamPercentage = Math.round((teamSold / teamGoal) * 100);
  const teamBarWidth = Math.min(teamPercentage, 100);
  const remainingTeam = Math.max(teamGoal - teamSold, 0);

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
            <p className="text-xs text-gray-700 mt-0.5">
              Solo meseros y capitanes 
            </p>
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
          <span className="text-gray-700 text-lg">
            Meta:  <span className='text-indigo-700 font-bold text-xl'> {globalGoal.toLocaleString()} </span>chiles
          </span>
        </div>
        <div className="mt-2 text-gray-700 text-lg">
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
            <p className="text-xs text-gray-700 mt-0.5">
              Solo meseros y capitanes — sin pedidos para llevar ni eventos
            </p>
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
          <span className="text-gray-700 text-lg">
            Meta: <span className='text-indigo-700 font-bold text-xl'> {teamGoal.toLocaleString()} </span>chiles
          </span>
        </div>
        <div className="mt-2 text-gray-700 text-lg">
          Faltan <span className="font-semibold text-indigo-700 text-xl">{remainingTeam.toLocaleString()}</span> chiles para completar la meta del equipo
        </div>
      </div>

      {/* Días hábiles del mes */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Días Hábiles del Mes (Mar — Dom)
          </p>
          <p className="text-sm text-gray-400 mt-0.5">
            Lunes Cerrado, Martes a Domingo Abierto
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#07074D]">
              {elapsedWorkDays}
              <span className="text-sm font-normal text-gray-400 ml-1">transcurridos</span>
            </p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-[#07074D]">
              {totalWorkDays}
              <span className="text-sm font-normal text-gray-400 ml-1">totales del mes</span>
            </p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-[#07074D]">
              {totalWorkDays - elapsedWorkDays}
              <span className="text-sm font-normal text-gray-400 ml-1">restantes</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};