// frontend/src/admin/components/sales/GlobalProgressCard.jsx
import React from 'react';
import { MonthSoldCard } from './MonthSoldCard';

export const GlobalProgressCard = ({
  globalGoal,
  globalSold,
  globalPercentage,
  teamGoal,
  teamSold,
  teamPercentage,
  elapsedWorkDays,
  totalWorkDays,
  employees,
  selectedMonth,
  adminSales = []
}) => {
  // Calcular chiles de empleados en el mes actual
  const employeeMonthSold = employees.reduce((sum, emp) => sum + Number(emp.month_sold || 0), 0);

  // Calcular chiles del admin en el mes actual
  const adminMonthSold = adminSales.reduce((sum, sale) => sum + Number(sale.chiles_sold || 0), 0);

  // Total mes: empleados + admin
  const totalMonthSold = employeeMonthSold + adminMonthSold;

  // Calcular porcentaje del progreso
  const progressPercent = globalGoal > 0 ? Math.round((globalSold / globalGoal) * 100) : 0;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Card: Meta Global de Temporada */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-6">
          <p className="text-xs text-gray-800 uppercase tracking-wider font-bold mb-3">
            Meta Global de Temporada
          </p>
          <p className="text-xs text-slate-600 mb-4">
            Solo meseros, capitanes y gerente 
          </p>

          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-[#07074D]">{globalPercentage}%</p>
              <p className="text-xs text-slate-600 mt-1">Progreso</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">{globalSold.toLocaleString()} chiles</p>
              <p className="text-sm text-indigo-600">de {globalGoal.toLocaleString()}</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all ${
                globalPercentage >= 100 ? 'bg-green-500' :
                globalPercentage >= 90 ? 'bg-yellow-500' :
                globalPercentage >= 80 ? 'bg-blue-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(globalPercentage, 100)}%` }}
            />
          </div>

          {/* Texto de progreso */}
          <p className="text-sm text-gray-600">
            {globalPercentage >= 100 ? (
              <span className="text-green-600 font-semibold">✓ Meta completada</span>
            ) : (
              <span className="text-gray-600">
                Faltan <span className="font-semibold text-orange-400">{Math.max(0, globalGoal - globalSold).toLocaleString()}</span> chiles para completar la meta global
              </span>
            )}
          </p>
        </div>

        {/* Card: Meta del Equipo Meseros */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-6">
          <p className="text-xs text-gray-800 uppercase tracking-wider font-bold mb-3">
            Meta del Equipo Meseros
          </p>
          <p className="text-xs text-slate-600 mb-4">
            Solo meseros y capitanes
          </p>

          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-[#07074D]">{teamPercentage}%</p>
              <p className="text-xs text-slate-600 mt-1">Progreso</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">{teamSold.toLocaleString()} chiles</p>
              <p className="text-sm text-indigo-600">de {teamGoal.toLocaleString()}</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all ${
                teamPercentage >= 100 ? 'bg-green-500' :
                teamPercentage >= 90 ? 'bg-yellow-500' :
                teamPercentage >= 80 ? 'bg-blue-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(teamPercentage, 100)}%` }}
            />
          </div>

          {/* Texto de progreso */}
          <p className="text-sm text-gray-600">
            {teamPercentage >= 100 ? (
              <span className="text-green-600 font-semibold">✓ Meta completada</span>
            ) : (
              <span className="text-gray-600">
                Faltan <span className="font-semibold text-orange-400">{Math.max(0, teamGoal - teamSold).toLocaleString()}</span> chiles para completar la meta global
              </span>
            )}
          </p>
        </div>

      </div>

      {/* Segunda fila: Chiles del mes y Días Hábiles alineados */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">

  {/* Card 1: Chiles vendidos en el mes */}
  <MonthSoldCard
    employees={employees}
    selectedMonth={selectedMonth}
    adminSales={adminSales}
    totalMonthSold={totalMonthSold}
  />

  {/* Card 2: Información de días hábiles */}
  <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-6 h-full flex flex-col justify-between">
    <p className="text-xs text-gray-800 uppercase tracking-wider font-bold mb-3">
      Días Hábiles del Mes (Mar — Dom)
    </p>

    <div className="grid grid-cols-3 gap-4 my-auto py-2">
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-500">{elapsedWorkDays}</p>
        <p className="text-xs text-gray-800 mt-1">Transcurridos</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-500">{totalWorkDays}</p>
        <p className="text-xs text-gray-800 mt-1">Totales del mes</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-500">{totalWorkDays - elapsedWorkDays}</p>
        <p className="text-xs text-gray-800 mt-1">Restantes</p>
      </div>
    </div>
  </div>

</div>
    </>
  );
};