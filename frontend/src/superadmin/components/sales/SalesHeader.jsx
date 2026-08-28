import React from 'react';

const MONTH_NAMES = { '08': 'Agosto', '09': 'Septiembre', '10': 'Octubre' };

export const SalesHeader = ({
  season,
  selectedMonth,
  monthOptions,
  monthsConfigured,
  onMonthChange,
  userRole,
  onRegisterSale,
  onSetupSeason,
  onConfigMonthlyGoals,
  noActiveSeason,
  monthConfigured,
  loading
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4">

      {/* Fila 1 — Título */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#07074D]">Temporada Chiles en Nogada</h1>
          {season ? (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-700">
             Temporada Activa
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-500">
              Sin temporada activa
            </span>
          )}
        </div>
        <p className="text-[#6B7280] mt-0.5">
          Control de ventas, metas mensuales y semáforo de rendimiento por colaborador.
        </p>
      </div>

      {/* Fila 2 — Selector horizontal de meses + botones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        {/* Selector horizontal de meses */}
        {season && (
          <div className="flex items-center gap-2 bg-white border border-[#e0e0e0] rounded-xl p-1.5 shadow-sm w-fit">
            {monthOptions.map(m => {
              const isSelected = selectedMonth === m.value;
              const isConfigured = monthsConfigured.includes(m.value);
              return (
                <button
                  key={m.value}
                  onClick={() => onMonthChange(m.value)}
                  className={`relative flex flex-col items-center px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#6A64F1] text-white shadow-md'
                      : 'text-[#6B7280] hover:bg-gray-100'
                  }`}
                >
                  {m.label}
                  {/* Badge de configurado */}
                  <span className={`text-xs font-normal mt-0.5 ${
                    isSelected ? 'text-indigo-200' : isConfigured ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {isConfigured ? ' Configurado' : 'Pendiente'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center gap-2 flex-wrap">
          {userRole === 'admin' && noActiveSeason && (
            <button
              onClick={onSetupSeason}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-sm text-sm"
            >
              Configurar Temporada
            </button>
          )}
          {userRole === 'admin' && season && (
            <button
              onClick={onConfigMonthlyGoals}
              className={`px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-sm text-sm ${
                monthConfigured
                  ? 'bg-white border border-[#6A64F1] text-[#6A64F1] hover:bg-indigo-50'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {monthConfigured ? ` Editar Metas — ${MONTH_NAMES[selectedMonth]}` : `⚙️ Configurar Metas — ${MONTH_NAMES[selectedMonth]}`}
            </button>
          )}
          {season && monthConfigured && (
            <button
              onClick={onRegisterSale}
              disabled={loading}
              className="bg-[#6A64F1] hover:bg-[#5b55e0] text-white px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-sm text-sm disabled:opacity-50"
            >
              + Registrar Venta Diaria
            </button>
          )}
        </div>
      </div>
    </div>
  );
};