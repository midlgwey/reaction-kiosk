import React from 'react';
import SentimentBadge from './SentimentBadge';
import { useLatestSuggestions } from '../../hooks/feedback/useLatestSuggestions';

const ChartLoading = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200 p-10">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando métricas...</span>
  </div>
);

export default function LatestSuggestionsWidget() {
  const { comments, loading } = useLatestSuggestions();

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden w-full h-full flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-black font-bold uppercase text-xs tracking-widest">
          Últimos Comentarios
        </h3>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Más recientes
        </span>
      </div>

      {/* Contenedor con scroll horizontal responsive */}
      <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
        <div className="min-w-max md:min-w-full divide-y divide-slate-50">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px] p-4 w-full">
              <ChartLoading />
            </div>
          ) : comments.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-xs italic w-full">
              No hay comentarios recientes
            </div>
          ) : (
            comments.map((item) => (
              <div 
                key={item.id} 
                className="px-6 py-4 hover:bg-slate-50 transition-colors flex flex-col gap-2 md:w-auto w-[380px] shrink-0"
              >
                
                {/* Fila superior: mesero, mesa y sentimiento */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-indigo-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {item.mesero?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate">{item.mesero || 'Sin nombre'}</span>
                    <span className="bg-slate-100 border border-slate-200 text-cyan-600 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shrink-0">
                      #{item.table_number || '-'}
                    </span>
                  </div>
                  <div className="shrink-0">
                    <SentimentBadge sentiment={item.sentiment} />
                  </div>
                </div>

                {/* Comentario */}
                <p className="text-xs text-black leading-relaxed line-clamp-3 italic break-all">
                  "{item.comment}"
                </p>

                {/* Fecha y turno */}
                <div className="flex items-center gap-2 text-[10px] text-cyan-600 font-bold whitespace-nowrap">
                  <span>
                    {new Date(item.date).toLocaleDateString('es-MX', { 
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                  <span>·</span>
                  <span className="uppercase">{item.shift}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}