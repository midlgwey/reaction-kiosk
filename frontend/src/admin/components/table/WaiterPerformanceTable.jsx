import React from 'react';
import { useWaiterPerformance } from '../../hooks/waiters/useWaiterPerformance';
import { usePeriodFilter } from '../../hooks/shared/usePeriodFilter';
import PeriodSelector from '../shared/PeriodSelector';

const MINIMO_APROBATORIO = 60;

export default function WaiterPerformanceTable() {
  const { selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, yearOptions } = usePeriodFilter();
  const { data, loading, error } = useWaiterPerformance(selectedMonth.value, selectedYear);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

      <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
            Reporte de Rendimiento Mensual
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Servicio + Cumplimiento — Mínimo aprobatorio: {MINIMO_APROBATORIO}%
          </p>
        </div>
        <PeriodSelector
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          yearOptions={yearOptions}
        />
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-rose-400 text-sm font-semibold">{error}</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-indigo-600 font-black bg-indigo-50 border-b border-slate-200">
                <th className="px-5 py-4 whitespace-nowrap">Mesero</th>
                <th className="px-5 py-4 text-center whitespace-nowrap">Captadas</th>
                <th className="px-5 py-4 text-center whitespace-nowrap">Mesas Reales</th>
                <th className="px-5 py-4 text-center whitespace-nowrap">Satisfacción</th>
                <th className="px-5 py-4 text-center whitespace-nowrap">Cumplimiento</th>
                <th className="px-5 py-4 text-center whitespace-nowrap min-w-[200px]">Resultado Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-400 text-sm italic">
                    No hay datos para este periodo
                  </td>
                </tr>
              ) : (
                data.map((row) => {
                  const aprobado = row.resultado_final !== null && parseFloat(row.resultado_final) >= MINIMO_APROBATORIO;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {row.mesero?.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{row.mesero}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2 py-1 rounded-md border border-indigo-100">
                          {row.captadas}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        {row.mesas_reales > 0 ? (
                          <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2 py-1 rounded-md border border-slate-200">
                            {row.mesas_reales}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs italic">Sin capturas</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="font-bold text-sm text-slate-600">
                          {row.satisfaccion}%
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="font-bold text-sm text-slate-600">
                          {row.mesas_reales > 0 ? `${row.cumplimiento}%` : '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {row.resultado_final !== null ? (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <span className={`font-black text-sm ${aprobado ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {row.resultado_final}%
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                                ${aprobado
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'}`}>
                                {aprobado ? 'Aprobado' : 'Reprobado'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${aprobado ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(parseFloat(row.resultado_final), 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs italic">Falta capturar mesas</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
        <p className="text-[10px] text-slate-400 font-medium">
          💡 Resultado Final = (Satisfacción × 50%) + (Cumplimiento × 50%). Cumplimiento se calcula con las mesas reales capturadas día a día por el gerente.
        </p>
      </div>

    </div>
  );
}