import React, { useState, useMemo } from 'react';
import { useDailyQuestions } from '../../hooks/dashboard/useDashboardWeekly';
import QuestionBar from './QuestionBar'; 

export default function DailyQuestions() {
  const [dateOption, setDateOption] = useState('hoy');
  const [customDate, setCustomDate] = useState('');

  const getFilters = useMemo(() => {
    const d = new Date();
    const formatDate = (date) => date.toISOString().split("T")[0]; 

    if (dateOption === 'hoy') return { startDate: formatDate(d), endDate: formatDate(d) };
    
    if (dateOption === 'ayer') {
      d.setDate(d.getDate() - 1);
      return { startDate: formatDate(d), endDate: formatDate(d) };
    }
    
    if (dateOption === 'antier') {
      d.setDate(d.getDate() - 2);
      return { startDate: formatDate(d), endDate: formatDate(d) };
    }

    if (dateOption === 'custom' && customDate) {
      return { startDate: customDate, endDate: customDate };
    }
    
    return { startDate: formatDate(d), endDate: formatDate(d) }; //Defualt a hoy
  }, [dateOption, customDate]);

  const { data, loading, error } = useDailyQuestions(getFilters);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 flex flex-col w-full space-y-6">
      
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

      {/* Estados */}
      {loading && <div className="text-center py-10 text-slate-400">Cargando datos...</div>}
      {error && <div className="text-center py-10 text-rose-500">Error al cargar.</div>}
      {!loading && !error && data.length === 0 && <div className="text-center py-10 text-slate-400">No hay encuestas en esta fecha.</div>}

      {/* Mapeo del Componente Hijo */}
      {!loading && !error && data.length > 0 && (
        <div className="space-y-6">
          {data.map((q) => (
            <QuestionBar key={q.id} question={q} />
          ))}
        </div>
      )}

    </div>
  );
}