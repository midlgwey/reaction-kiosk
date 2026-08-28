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
  const remaining = Math.max(globalGoal - globalSold, 0);
  const barWidth = Math.min(globalPercentage, 100);

  const barColor =
    globalPercentage >= 100 ? 'bg-green-500' :
    globalPercentage >= 90  ? 'bg-orange-400' :
    globalPercentage >= 80  ? 'bg-blue-500' :
    'bg-red-500';

  return (
    <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* Meta Global */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#07074D] uppercase tracking-wider">
              🎯 Meta Global de Temporada
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Incluye meseros, capitanes, pedidos para llevar y eventos
            </p>
          </div>
          <span className={`text-lg font-bold ${globalPercentage >= 100 ? 'text-green-600' : 'text-[#07074D]'}`}>
            {globalPercentage}%
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#07074D]">
            {globalSold.toLocaleString()} chiles vendidos
          </span>
          <span className="text-gray-500">
            Meta: {globalGoal.toLocaleString()} chiles
          </span>
        </div>

        <div className="mt-2 text-xs text-gray-400">
          Faltan <span className="font-semibold text-[#07074D]">{remaining.toLocaleString()}</span> chiles para completar la meta global
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-4 flex flex-col justify-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
            Meta del Equipo Meseros
          </p>
          <p className="text-2xl font-bold text-[#07074D]">
            {teamGoal.toLocaleString()}
            <span className="text-sm font-normal text-gray-400 ml-1">chiles</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-4 flex flex-col justify-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
            Días Hábiles del Mes
          </p>
          <p className="text-2xl font-bold text-[#07074D]">
            {elapsedWorkDays}
            <span className="text-sm font-normal text-gray-400 ml-1">/ {totalWorkDays} días</span>
          </p>
        </div>
      </div>
    </div>
  );
};