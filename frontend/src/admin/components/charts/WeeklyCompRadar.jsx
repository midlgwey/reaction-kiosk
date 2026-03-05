import React, { useState, useMemo } from 'react';
import { useDailyQuestions } from '../../hooks/dashboard/useDashboardWeekly';
import QuestionBar from './QuestionBar'; 
import ChartLoading from './ChartLoading'; // Asegúrate de ajustar esta ruta

export default function DailyQuestions() {
  const [dateOption, setDateOption] = useState('hoy');
  const [customDate, setCustomDate] = useState('');

  const getFilters = useMemo(() => {
    const d = new Date();
    
    // Función para formatear la fecha a YYYY-MM-DD respetando la zona horaria local
    const formatLocalDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Calcular la fecha según la opción seleccionada
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
    
    // Opción por defecto
    return { startDate: formatLocalDate(d), endDate: formatLocalDate(d) }; 
  }, [dateOption, customDate]);

  const { data, loading, error } = useDailyQuestions(getFilters);

  return (
    <div className="space-y-6">
      
      {/* Encabezado y Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">Radiografía por Pregunta</h3>
          <p className="text-xs text-slate-500 mt-1">Análisis detallado de las 4 preguntas de la encuesta.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select 
            className="text-sm bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2 outline-none"
            value={dateOption}
            onChange={(e) => setDateOption(e.target.value)}
          >
            <option value="hoy">Hoy</option>
            <option value="ayer">Ayer</option>
            <option value="antier">Antier</option>
            <option disabled>──────────</option>
            <option value="custom">📅 Elegir fecha...</option>
          </select>

          {dateOption === 'custom' && (
            <input 
              type="date" 
              className="text-sm bg-white border border-indigo-300 text-indigo-700 rounded-lg p-2 outline-none animate-fade-in"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]} 
            />
          )}
        </div>
      </div>

      {/* Leyenda de Colores */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Excelente</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-400"></span> Bueno</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Puede Mejorar</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400"></span> Malo</div>
      </div>

      {/* Área de renderizado con manejo de estados */}
      <div className="flex-1 relative min-h-[200px]">
        {loading ? (
          <ChartLoading />
        ) : error ? (
          <div className="h-full flex items-center justify-center text-rose-500 text-sm font-semibold">
            {error.message || "Error al cargar los datos."}
          </div>
        ) : (!data || data.length === 0) ? (
          <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">
            No hay encuestas registradas en esta fecha.
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