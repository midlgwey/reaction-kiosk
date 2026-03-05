import React, { useState, useMemo } from 'react';
import { Select, Datepicker } from 'flowbite-react';
import { useDailyQuestions } from '../../hooks/dashboard/useDashboardWeekly';
import QuestionBar from './QuestionBar'; 

// Componente para indicar el estado de carga
const ChartLoading = () => (
  <div className="h-full w-full min-h-[200px] flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando datos...</span>
  </div>
);

// Helper de fechas estandarizado para mantener compatibilidad con el backend
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DailyQuestions() {
  const [dateOption, setDateOption] = useState('hoy');
  const [customDate, setCustomDate] = useState('');

  // Lógica de filtrado de fechas
  const getFilters = useMemo(() => {
    const d = new Date();

    if (dateOption === 'hoy') {
      return { startDate: formatLocalDate(d), endDate: formatLocalDate(d) };
    }
    
    if (dateOption === 'ayer') {
      d.setDate(d.getDate() - 1);
      return { startDate: formatLocalDate(d), endDate: formatLocalDate(d) };
    }
    
    if (dateOption === 'antier') {
      d.setDate(d.getDate() - 2);
      return { startDate: formatLocalDate(d), endDate: formatLocalDate(d) };
    }

    if (dateOption === 'custom' && customDate) {
      return { startDate: customDate, endDate: customDate };
    }
    
    return { startDate: formatLocalDate(d), endDate: formatLocalDate(d) }; 
  }, [dateOption, customDate]);

  const { data, loading, error } = useDailyQuestions(getFilters);

  return (
    <div className="space-y-6">
      
      {/* Controles de encabezado y filtro modular */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">Radiografía por Pregunta</h3>
          <p className="text-xs text-slate-500 mt-1">Análisis detallado de las 4 preguntas de la encuesta.</p>
        </div>
        
        {/* Controles de Flowbite */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          
          <div className="min-w-[140px]">
            <Select 
              id="date-select" 
              value={dateOption} 
              onChange={(e) => setDateOption(e.target.value)}
              sizing="sm"
            >
              <option value="hoy">Hoy</option>
              <option value="ayer">Ayer</option>
              <option value="antier">Antier</option>
              <option disabled>──────────</option>
              <option value="custom">📅 Elegir fecha...</option>
            </Select>
          </div>

          {/* Renderizado del Datepicker de Flowbite */}
          {dateOption === 'custom' && (
            <div className="w-full sm:w-48 animate-fade-in">
              <Datepicker 
                language="es-MX"
                labelTodayButton="Hoy"
                labelClearButton="Limpiar"
                maxDate={new Date()}
                onSelectedDateChanged={(date) => {
                  setCustomDate(formatLocalDate(date));
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Leyenda visual */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Excelente</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-400"></span> Bueno</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Puede Mejorar</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400"></span> Malo</div>
      </div>

      {/* Renderizado de estados y gráfica */}
      <div className="flex-1 relative min-h-[150px]">
        {loading ? (
          <ChartLoading />
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-400 text-sm font-semibold">
            Error al cargar la radiografía
          </div>
        ) : (!data || data.length === 0) ? (
          <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">
            No hay encuestas registradas en esta fecha
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((q) => (
              <QuestionBar key={q.id} question={q} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}