import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useWaiterMonthlyReport } from '../../hooks/waiters/useWaiterMonthlyReport';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faMedal } from '@fortawesome/free-solid-svg-icons'
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ChartLoading = () => (
  <div className="h-full w-full min-h-[300px] flex flex-col items-center justify-center bg-white/40 rounded-2xl animate-pulse border-2 border-dashed border-slate-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">Cargando reporte...</span>
  </div>
);

/**
 * Determina el estado de desempeño basado en resultado final
 */
const getPerformanceLevel = (score) => {
  const num = parseFloat(score);
  if (num >= 80) return { label: 'Excelente', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  if (num >= 60) return { label: 'Bueno', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  if (num >= 40) return { label: 'Regular', color: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: 'Bajo', color: 'bg-rose-100 text-rose-700 border-rose-200' };
};

/**
 * Calcula la tendencia comparando primer y último día del mes
 */
const calculateTrend = (dailyData) => {
  if (!dailyData || dailyData.length < 2) return { icon: faSun, color: 'text-slate-400', label: 'Sin datos' };
  
  const first = parseFloat(dailyData[0].satisfaccion);
  const last = parseFloat(dailyData[dailyData.length - 1].satisfaccion);
  
  if (last > first + 2) return { icon: faSun, color: 'text-emerald-500', label: 'Mejorando' };
  if (last < first - 2) return { icon: faMoon, color: 'text-rose-500', label: 'Empeorando' };
  return { icon: faSun, color: 'text-slate-400', label: 'Estable' };
};

/**
 * Componente para mostrar el gráfico de evolución mensual
 */
function EvolutionChart({ dailyStats, selectedWaiterId }) {
  // Si hay mesero seleccionado, mostrar solo ese; si no, mostrar todos
  const chartData = useMemo(() => {
    if (!dailyStats || dailyStats.length === 0) return [];

    if (selectedWaiterId) {
      const waiter = dailyStats.find(w => w.waiter_id === selectedWaiterId);
      return waiter?.datos_diarios || [];
    }

    // Consolidar datos de todos los meseros por fecha
    const dataByDate = {};
    dailyStats.forEach(waiter => {
      waiter.datos_diarios.forEach(day => {
        if (!dataByDate[day.fecha]) {
          dataByDate[day.fecha] = { fecha: day.fecha, fecha_label: formatFecha(day.fecha) };
        }
        dataByDate[day.fecha][`${waiter.mesero}_satisfaccion`] = parseFloat(day.satisfaccion);
      });
    });

    return Object.values(dataByDate).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [dailyStats, selectedWaiterId]);

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (chartData.length === 0) {
    return <ChartLoading />;
  }

  return (
    <div className="w-full h-[350px] bg-white rounded-2xl border border-slate-200 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="fecha_label" 
            tick={{ fontSize: 11, fill: '#64748b' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 11, fill: '#64748b' }}
            label={{ value: 'Satisfacción (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #475569',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value) => `${value.toFixed(1)}%`}
          />
          {selectedWaiterId ? (
            <Line 
              type="monotone" 
              dataKey={`${dailyStats.find(w => w.waiter_id === selectedWaiterId)?.mesero}_satisfaccion`}
              stroke="#6366f1" 
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4 }}
              activeDot={{ r: 6 }}
            />
          ) : (
            dailyStats.slice(0, 5).map((waiter, idx) => (
              <Line
                key={waiter.waiter_id}
                type="monotone"
                dataKey={`${waiter.mesero}_satisfaccion`}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[idx % colors.length], r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))
          )}
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Formatea la fecha para mostrar en el gráfico
 */
function formatFecha(dateStr) {
  return format(new Date(dateStr + 'T00:00:00'), 'dd MMM', { locale: es });
}

/**
 * Fila de tabla con desempeño del mesero
 */
function PerformanceRow({ waiter, dailyStats, onSelect, isSelected }) {
  const dailyData = dailyStats.find(d => d.waiter_id === waiter.id)?.datos_diarios || [];
  const trend = calculateTrend(dailyData);
  const performance = getPerformanceLevel(waiter.resultado_final);

  return (
    <div
      onClick={() => onSelect(waiter.id)}
      className={`grid grid-cols-1 sm:grid-cols-6 gap-2 sm:gap-4 px-4 sm:px-6 py-4 rounded-xl transition-all cursor-pointer border-2 ${
        isSelected
          ? 'bg-indigo-50 border-indigo-300'
          : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
      }`}
    >
      {/* Mesero */}
      <div className="sm:col-span-1">
        <p className="text-xs text-slate-500 font-semibold uppercase">Mesero</p>
        <p className="font-bold text-sm text-slate-800 mt-1">{waiter.mesero}</p>
      </div>

      {/* Captadas */}
      <div className="sm:col-span-1">
        <p className="text-xs text-slate-500 font-semibold uppercase">Captadas</p>
        <p className="font-bold text-sm text-slate-800 mt-1">{waiter.captadas}</p>
      </div>

      {/* % Satisfacción */}
      <div className="sm:col-span-1">
        <p className="text-xs text-slate-500 font-semibold uppercase">Satisfacción</p>
        <p className="font-bold text-sm text-emerald-600 mt-1">{waiter.satisfaccion}%</p>
      </div>

      {/* % Cumplimiento */}
      <div className="sm:col-span-1">
        <p className="text-xs text-slate-500 font-semibold uppercase">Cumplimiento</p>
        <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(parseFloat(waiter.cumplimiento), 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-600 mt-1">{waiter.cumplimiento}%</p>
      </div>

      {/* Resultado Final */}
      <div className="sm:col-span-1">
        <p className="text-xs text-slate-500 font-semibold uppercase">Resultado</p>
        {waiter.resultado_final ? (
          <p className={`font-bold text-sm mt-1 ${
            parseFloat(waiter.resultado_final) >= 80 ? 'text-emerald-600' :
            parseFloat(waiter.resultado_final) >= 60 ? 'text-blue-600' :
            parseFloat(waiter.resultado_final) >= 40 ? 'text-amber-600' : 'text-rose-600'
          }`}>
            {waiter.resultado_final}
          </p>
        ) : (
          <p className="text-xs text-slate-400 mt-1">Sin mesas</p>
        )}
      </div>

      {/* Tendencia */}
      <div className="sm:col-span-1">
        <p className="text-xs text-slate-500 font-semibold uppercase">Tendencia</p>
        <div className="mt-1 flex items-center gap-2">
          <FontAwesomeIcon icon={trend.icon} className={`text-lg ${trend.color}`} />
          <span className="text-[10px] text-slate-600">{trend.label}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente principal del reporte
 */
export default function ReporteRendimientoMensual() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [selectedWaiterId, setSelectedWaiterId] = useState(null);

  const { dailyStats, performanceReport, loading, error } = useWaiterMonthlyReport(month, year);

  const months = [
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
    { value: 12, label: 'Diciembre' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 sm:p-6 flex flex-col w-full">
      
      {/* Encabezado */}
      <div className="mb-6 pb-6 border-b border-slate-200">
        <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
          Reporte de Rendimiento Mensual
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Análisis de desempeño, satisfacción y cumplimiento por mesero
        </p>

        {/* Selectores */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico de evolución */}
      <div className="mb-8">
        <h4 className="text-slate-700 font-bold text-sm mb-4">Evolución de Satisfacción</h4>
        {loading ? (
          <ChartLoading />
        ) : error ? (
          <div className="p-6 text-center text-rose-500 font-semibold text-sm">{error}</div>
        ) : (
          <EvolutionChart dailyStats={dailyStats} selectedWaiterId={selectedWaiterId} />
        )}
      </div>

      {/* Tabla de resumen */}
      <div>
        <h4 className="text-slate-700 font-bold text-sm mb-4">Resumen Mensual</h4>
        {loading ? (
          <ChartLoading />
        ) : error ? (
          <div className="p-6 text-center text-rose-500 font-semibold text-sm">{error}</div>
        ) : performanceReport.length > 0 ? (
          <div className="space-y-3 overflow-y-auto max-h-[450px]">
            {performanceReport.map(waiter => (
              <PerformanceRow
                key={waiter.id}
                waiter={waiter}
                dailyStats={dailyStats}
                onSelect={setSelectedWaiterId}
                isSelected={selectedWaiterId === waiter.id}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">
            No hay datos para el período seleccionado
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-6 justify-center text-xs">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faSun} className="text-emerald-500" />
          <span className="text-slate-600">Mejorando</span>
        </div>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faSun} className="text-slate-400" />
          <span className="text-slate-600">Estable</span>
        </div>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faMoon} className="text-rose-500" />
          <span className="text-slate-600">Empeorando</span>
        </div>
      </div>
    </div>
  );
}