// frontend/src/admin/components/sales/SalesHeader.jsx
import React from 'react';

export const SalesHeader = ({
  season,
  selectedMonth,
  monthOptions,
  onMonthChange,
  userRole,
  onRegisterSale,
  onSetupSeason,
  noActiveSeason,
  loading
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4">
      {/* Fila 1 — Título y badge */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#07074D]">Temporada Chiles en Nogada</h1>
          {season ? (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-700">
              🌶️ Temporada Activa
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-500">
              ⏸️ Sin temporada activa
            </span>
          )}
        </div>
        <p className="text-[#6B7280] mt-0.5">
          Control de ventas, metas mensuales y semáforo de rendimiento por colaborador.
        </p>
      </div>

      {/* Fila 2 — Selector de mes + botones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        {/* Selector de mes estilo barra indigo */}
        <div className="flex items-center gap-3 bg-indigo-50 border-l-4 border-[#6A64F1] rounded-lg px-4 py-3 shadow-sm w-fit">
          <span className="text-[#07074D] font-bold text-sm uppercase tracking-wide">
            📅 Mes:
          </span>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-transparent text-[#07074D] font-semibold text-sm border-none outline-none cursor-pointer"
          >
            {monthOptions.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          {season && (
            <span className="text-[#6B7280] text-xs font-medium">
              {season.season_start} — {season.season_end}
            </span>
          )}
        </div>

        {/* Botones */}
        <div className="flex items-center gap-2 flex-wrap">
          {userRole === 'admin' && noActiveSeason && (
            <button
              onClick={onSetupSeason}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-sm text-sm"
            >
              ⚙️ Configurar Temporada
            </button>
          )}
          {season && (
            <button
              onClick={onRegisterSale}
              disabled={loading}
              className="bg-[#6A64F1] hover:bg-[#5b55e0] text-white px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-sm text-sm flex items-center gap-2 disabled:opacity-50"
            >
              + Registrar Venta Diaria
            </button>
          )}
        </div>
      </div>
    </div>
  );
};