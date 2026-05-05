import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { useWaiterPerformance } from '../../hooks/waiters/useWaiterPerformance';

const MINIMO_APROBATORIO = 60;

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const customSelectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    borderColor: '#e2e8f0',
    fontSize: '0.75rem',
    minHeight: '36px',
    boxShadow: 'none',
    '&:hover': { borderColor: '#6366f1' }
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f5f3ff' : 'white',
    color: state.isSelected ? 'white' : '#475569',
    fontSize: '0.75rem',
  })
};

export default function WaiterPerformanceTable() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    MESES.find(m => m.value === (now.getMonth() + 1))
  );
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [mesasReales, setMesasReales] = useState({});

  const yearOptions = useMemo(() => [
    { value: now.getFullYear(), label: `${now.getFullYear()}` },
    { value: now.getFullYear() - 1, label: `${now.getFullYear() - 1}` },
  ], []);

  const { data, loading, error } = useWaiterPerformance(selectedMonth.value, selectedYear);

  const handleMesasChange = (id, value) => {
    setMesasReales(prev => ({ ...prev, [id]: value }));
  };

  const calcSatisfaccion = (suma_p1, captadas) => {
    if (captadas === 0) return null;
    return ((suma_p1 / (captadas * 4)) * 100).toFixed(1);
  };

  const calcRendimiento = (suma_p1, rechazos, mesasTotales) => {
    const mesas = parseInt(mesasTotales);
    if (!mesas || mesas === 0) return null;
    return (((suma_p1 + rechazos) / (mesas * 4)) * 100).toFixed(1);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
            Reporte de Rendimiento Mensual
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Satisfacción y productividad — Mínimo aprobatorio: {MINIMO_APROBATORIO}%
          </p>
        </div>

        {/* Selects de mes y año */}
        <div className="flex gap-2 items-center">
          <div className="w-36">
            <Select
              options={MESES}
              value={selectedMonth}
              onChange={(opt) => {
                setSelectedMonth(opt);
                setMesasReales({});
              }}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>
          <div className="w-24">
            <Select
              options={yearOptions}
              value={{ value: selectedYear, label: `${selectedYear}` }}
              onChange={(opt) => {
                setSelectedYear(opt.value);
                setMesasReales({});
              }}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
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
                <th className="px-5 py-4 text-center whitespace-nowrap">Rechazos</th>
                <th className="px-5 py-4 text-center whitespace-nowrap">Satisfacción %</th>
                <th className="px-5 py-4 text-center whitespace-nowrap">Mesas Reales</th>
                <th className="px-5 py-4 text-center whitespace-nowrap min-w-[200px]">Rendimiento Final</th>
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
                  const satisfaccion = calcSatisfaccion(row.suma_p1, row.captadas);
                  const rendimiento = calcRendimiento(row.suma_p1, row.rechazos, mesasReales[row.id]);
                  const aprobado = rendimiento !== null && parseFloat(rendimiento) >= MINIMO_APROBATORIO;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">

                      {/* Mesero */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {row.mesero?.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{row.mesero}</span>
                        </div>
                      </td>

                      {/* Captadas */}
                      <td className="px-5 py-4 text-center">
                        <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2 py-1 rounded-md border border-indigo-100">
                          {row.captadas}
                        </span>
                      </td>

                      {/* Rechazos */}
                      <td className="px-5 py-4 text-center">
                        <span className={`font-bold text-xs px-2 py-1 rounded-md border
                          ${row.rechazos > 0
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                          {row.rechazos}
                        </span>
                      </td>

                      {/* Satisfacción */}
                      <td className="px-5 py-4 text-center">
                        {satisfaccion !== null ? (
                          <span className={`font-black text-sm
                            ${parseFloat(satisfaccion) >= 75 ? 'text-emerald-600' :
                              parseFloat(satisfaccion) >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {satisfaccion}%
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs italic">Sin datos</span>
                        )}
                      </td>

                      {/* Mesas Reales Input */}
                      <td className="px-5 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={mesasReales[row.id] || ''}
                          onChange={(e) => handleMesasChange(row.id, e.target.value)}
                          className="w-20 text-center border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                        />
                      </td>

                      {/* Rendimiento Final */}
                      <td className="px-5 py-4">
                        {rendimiento !== null ? (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <span className={`font-black text-sm ${aprobado ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {rendimiento}%
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                                ${aprobado
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'}`}>
                                {aprobado ? 'Aprobado ✅' : 'Reprobado ❌'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${aprobado ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(parseFloat(rendimiento), 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs italic">Ingresa mesas</span>
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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
        <p className="text-[10px] text-slate-400 font-medium">
          💡 Ingresa el número de mesas reales del mes para calcular el Rendimiento Final.
          Cada rechazo suma 1 punto extra al mesero por haber entregado la tablet.
        </p>
      </div>

    </div>
  );
}