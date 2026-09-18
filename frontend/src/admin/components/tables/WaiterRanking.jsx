import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import DashboardFilter from '../shared/DashboardFilter';
import { useWaiterRanking } from '../../../admin/hooks/waiters/useWaiterRanking';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faMedal } from '@fortawesome/free-solid-svg-icons';

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

/**
 * Estilos según puntuación
 */
const getScoreStyles = (pts) => {
  if (pts >= 32) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (pts >= 16) return "bg-blue-50 border-blue-200 text-blue-700";
  if (pts > 0) return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-rose-50 border-rose-200 text-rose-700";
};

/**
 * Componente de medalla para posiciones
 */
const MedalIcon = ({ position }) => {
  if (position === 0) return <FontAwesomeIcon icon={faMedal} className="text-yellow-500 text-lg" />;
  if (position === 1) return <FontAwesomeIcon icon={faMedal} className="text-gray-400 text-lg" />;
  if (position === 2) return <FontAwesomeIcon icon={faMedal} className="text-amber-700 text-lg" />;
  return <span className="font-bold text-slate-700">{position + 1}</span>;
};

/**
 * Tarjeta para móvil
 */
function MobileWaiterCard({ waiter, index }) {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
      {/* Encabezado: nombre y puntuación */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-indigo-900 font-bold flex items-center justify-center text-xs shrink-0 border border-orange-200">
            {waiter.mesero?.charAt(0) || '?'}
          </div>
          <p className="font-bold text-sm text-slate-800 truncate">{waiter.mesero}</p>
        </div>
        <MedalIcon position={index} />
      </div>

      {/* Puntuación destacada */}
      <div className={`px-3 py-1.5 rounded-full text-center border ${getScoreStyles(waiter.puntuacion)}`}>
        <span className="font-bold text-sm">{waiter.puntuacion} pts</span>
        <p className="text-[10px] font-medium">Promedio: {waiter.promedio}</p>
      </div>

      {/* Datos en fila */}
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div className="text-center">
          <p className="font-bold text-slate-700">{waiter.interacciones}</p>
          <p className="text-slate-500">Encuestas</p>
        </div>
        <div className="text-center">
          <p className={`font-bold ${waiter.rechazos > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {waiter.rechazos}
          </p>
          <p className="text-slate-500">Rechazos</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-indigo-600">
            {waiter.detalle_mesas ? waiter.detalle_mesas.split(',').length : 0}
          </p>
          <p className="text-slate-500">Mesas</p>
        </div>
      </div>

      {/* Mesas */}
      {waiter.detalle_mesas && (
        <div className="pt-2 border-t border-slate-200">
          <p className="text-[10px] font-semibold text-slate-600 mb-1">Mesas:</p>
          <div className="flex flex-wrap gap-1">
            {waiter.detalle_mesas.split(',').map((mesa, i) => (
              <span key={i} className="bg-indigo-100 border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold">
                {mesa.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Fila para tabla de desktop
 */
function DesktopWaiterRow({ waiter, index }) {
  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100 last:border-0">
      {/* Posición / Medalla */}
      <div className="col-span-1 text-center">
        <MedalIcon position={index} />
      </div>

      {/* Avatar y Nombre */}
      <div className="col-span-3 flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-orange-100 text-indigo-900 font-bold flex items-center justify-center text-sm shrink-0 border border-orange-200">
          {waiter.mesero?.charAt(0) || '?'}
        </div>
        <p className="font-bold text-slate-700 text-sm truncate">{waiter.mesero}</p>
      </div>

      {/* Desempeño */}
      <div className="col-span-2 text-center">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreStyles(waiter.puntuacion)}`}>
          {waiter.puntuacion} pts
        </span>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">Promedio: {waiter.promedio}</p>
      </div>

      {/* Encuestas */}
      <div className="col-span-2 text-center">
        <span className="bg-slate-100 border border-slate-200 text-cyan-600 px-2 py-1 rounded text-xs font-bold">
          {waiter.interacciones}
        </span>
      </div>

      {/* Rechazos */}
      <div className="col-span-1 flex justify-center">
        <span className={`px-2 py-1 rounded text-xs font-bold border ${
          waiter.rechazos > 0 
            ? 'bg-rose-100 border-rose-200 text-rose-600' 
            : 'bg-slate-100 border-slate-200 text-slate-400'
        }`}>
          {waiter.rechazos}
        </span>
      </div>

      {/* Mesas */}
      <div className="col-span-3 flex justify-end flex-wrap gap-1">
        {waiter.detalle_mesas
          ? waiter.detalle_mesas.split(',').map((mesa, i) => (
              <span key={i} className="bg-slate-100 border border-slate-200 text-cyan-600 px-2 py-1 rounded text-xs font-bold">
                {mesa.trim()}
              </span>
            ))
          : <span className="text-slate-400 text-xs">—</span>
        }
      </div>
    </div>
  );
}

export default function WaiterRanking() {
  const [activeShift, setActiveShift] = useState('matutino');
  const [selectedOption, setSelectedOption] = useState(dateOptions[0]);
  const [selectedDay, setSelectedDay] = useState(new Date());

  const selectedDate = useMemo(() => {
    const d = new Date();
    const option = selectedOption.value;
    if (option === 'hoy')    return format(d, 'yyyy-MM-dd');
    if (option === 'ayer')   { d.setDate(d.getDate() - 1); return format(d, 'yyyy-MM-dd'); }
    if (option === 'antier') { d.setDate(d.getDate() - 2); return format(d, 'yyyy-MM-dd'); }
    if (option === 'custom' && selectedDay) return format(selectedDay, 'yyyy-MM-dd');
    return format(d, 'yyyy-MM-dd');
  }, [selectedOption, selectedDay]);

  const { data, loading, error } = useWaiterRanking(selectedDate, activeShift);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col w-full overflow-hidden">
      
      {/* Cabecera y Controles de Filtro */}
      <div className="p-4 md:p-6 border-b border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
          Ranking de Servicio
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Selector de Turno */}
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveShift('matutino')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                activeShift === 'matutino' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <FontAwesomeIcon icon={faSun} className="w-4 h-4 text-amber-500 mr-1" />
              Matutino
            </button>
            <button
              onClick={() => setActiveShift('vespertino')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                activeShift === 'vespertino' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <FontAwesomeIcon icon={faMoon} className="w-4 h-4 text-amber-500 mr-1" />
              Vespertino
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

      {/* Contenido */}
      <div className="flex-1 min-h-[450px] flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <ChartLoading />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-rose-500 font-medium italic text-center">{error}</p>
          </div>
        ) : Array.isArray(data) && data.length > 0 ? (
          <>
            {/* VERSIÓN MOBILE */}
            <div className="block sm:hidden flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {data.map((waiter, index) => (
                  <MobileWaiterCard key={waiter.mesero || index} waiter={waiter} index={index} />
                ))}
              </div>
            </div>

            {/* VERSIÓN DESKTOP */}
            <div className="hidden sm:flex flex-col flex-1 overflow-y-auto">
              {/* Encabezado de Columnas */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs text-indigo-600 font-semibold uppercase tracking-wider border-b border-slate-300 sticky top-0 bg-white">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-3">Mesero</div>
                <div className="col-span-2 text-center">Desempeño</div>
                <div className="col-span-2 text-center">Encuestas</div>
                <div className="col-span-1 text-center">Rechazos</div>
                <div className="col-span-3 text-right">Mesas</div>
              </div>

              {/* Filas */}
              <div className="flex-1 overflow-y-auto">
                {data.map((waiter, index) => (
                  <DesktopWaiterRow key={waiter.mesero || index} waiter={waiter} index={index} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="italic text-sm text-slate-400">No hay registros para este turno.</p>
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