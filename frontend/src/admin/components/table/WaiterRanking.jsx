import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import WaiterRow from './WaiterRow';
import DashboardFilter from '../shared/DashboardFilter';
import { useWaiterRanking } from '../../../admin/hooks/waiters/useWaiterRanking';

/**
 * Indicador visual de carga
 */
const ChartLoading = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200 p-10">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando métricas...</span>
  </div>
);

/**
 * Opciones de filtrado por fecha
 */
const dateOptions = [
  { value: 'hoy',    label: 'Hoy' },
  { value: 'ayer',   label: 'Ayer' },
  { value: 'antier', label: 'Antier' },
  { value: 'custom', label: '📅 Elegir fecha...' },
];

export default function WaiterRanking() {
  // Estados para el control de turnos y filtros de fecha
  const [activeShift, setActiveShift] = useState('matutino');
  const [selectedOption, setSelectedOption] = useState(dateOptions[0]);
  const [selectedDay, setSelectedDay] = useState(new Date());

  /**
   * Memorización de la fecha seleccionada para optimizar peticiones
   */
  const selectedDate = useMemo(() => {
    const d = new Date();
    const option = selectedOption.value;
    if (option === 'hoy')    return format(d, 'yyyy-MM-dd');
    if (option === 'ayer')   { d.setDate(d.getDate() - 1); return format(d, 'yyyy-MM-dd'); }
    if (option === 'antier') { d.setDate(d.getDate() - 2); return format(d, 'yyyy-MM-dd'); }
    if (option === 'custom' && selectedDay) return format(selectedDay, 'yyyy-MM-dd');
    return format(d, 'yyyy-MM-dd');
  }, [selectedOption, selectedDay]);

  // Obtención de datos mediante el hook personalizado
  const { data, loading, error } = useWaiterRanking(selectedDate, activeShift);

  return (
   <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col w-full overflow-hidden">

      {/* Cabecera y Controles de Filtro */}
      <div className="p-4 md:p-6 border-b border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
          Ranking de Servicio
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Selector de Turno */}
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveShift('matutino')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                activeShift === 'matutino' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              ☀️ Matutino
            </button>
            <button
              onClick={() => setActiveShift('vespertino')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                activeShift === 'vespertino' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              🌙 Vespertino
            </button>
          </div>

          {/* Filtro de Fecha */}
          <div className="w-full sm:w-auto">
            <DashboardFilter
              options={dateOptions}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
            />
          </div>
        </div>
      </div>

      {/* Contenedor de la Tabla con Scroll Horizontal */}
      <div className="flex-1 p-2 min-h-[450px] flex flex-col overflow-x-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[350px]">
            <ChartLoading />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center min-h-[350px]">
            <p className="text-rose-500 font-medium italic text-center">{error}</p>
          </div>
        ) : (
          <div className="min-w-max lg:min-w-full">
            {/* Encabezado de Columnas (Visible solo en Desktop) */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs text-indigo-600 font-semibold uppercase tracking-wider border-b border-slate-300 lg:w-auto w-[600px] shrink-0">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3">Mesero</div>
              <div className="col-span-2 text-center">Desempeño</div>
              <div className="col-span-2 text-center">Encuestas</div>
              <div className="col-span-1 text-center">Rechazos</div>
              <div className="col-span-3 text-right">Mesas</div>
            </div>

            {/* Listado Dinámico de Resultados */}
            <div className="flex flex-col gap-1">
              {Array.isArray(data) && data.length > 0 ? (
                data.map((waiter, index) => (
                  <WaiterRow 
                    key={waiter.mesero || index} 
                    waiter={waiter} 
                    index={index} 
                  />
                ))
              ) : (
                <div className="flex items-center justify-center min-h-[300px]">
                  <p className="italic text-sm text-slate-400">No hay registros para este turno.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Leyenda de Puntuaciones */}
      <footer className="bg-slate-50 border-t border-slate-200 p-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b sm:border-b-0 sm:border-r border-slate-300 pb-1 sm:pb-0 sm:pr-6">
            Valores por respuesta
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-medium text-slate-600">Excelente: <b className="text-emerald-700">+4 pts</b></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-[11px] font-medium text-slate-600">Bueno: <b className="text-blue-700">+2 pts</b></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-[11px] font-medium text-slate-600">Regular: <b className="text-amber-700">0 pts</b></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-[11px] font-medium text-slate-600">Malo: <b className="text-rose-700">-5 pts</b></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}