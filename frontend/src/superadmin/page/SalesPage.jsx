import React from 'react';
import ChileSalesTable from '../components/SalesTable';

export default function ChileSalesPage() {
  // Simulación de datos globales de la temporada (1 de Agosto al 31 de Octubre)
  const totalSeasonSold = 1880;
  const seasonGoal = 5000;
  const seasonPercentage = Math.min(Math.round((totalSeasonSold / seasonGoal) * 100), 100);

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl flex flex-col gap-8">
        
        {/* Tarjeta de Progreso General de la Temporada */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <span className="inline-block rounded-md bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#6A64F1] mb-2">
                Temporada Activa: 1 Ago - 31 Oct
              </span>
              <h2 className="text-xl font-bold text-[#07074D]">Meta General de Chiles en Nogada</h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-extrabold text-[#6A64F1]">{totalSeasonSold}</span>
              <span className="text-sm font-medium text-gray-500"> / {seasonGoal} chiles vendidos</span>
            </div>
          </div>

          {/* Barra de Progreso Global */}
          <div className="w-full">
            <div className="flex justify-between mb-1 text-sm font-semibold text-gray-700">
              <span>Progreso total del restaurante</span>
              <span>{seasonPercentage}%</span>
            </div>
            <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden p-0.5 border border-gray-200">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[#6A64F1] transition-all duration-700 shadow-sm"
                style={{ width: `${seasonPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabla de Rendimiento por Mesero */}
        <ChileSalesTable />

      </div>
    </div>
  );
}