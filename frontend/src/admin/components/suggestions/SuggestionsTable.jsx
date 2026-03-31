import React, { useState } from 'react';
import SentimentBadge from './SentimentBadge';

const ExpandableComment = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)} 
      className="cursor-pointer group relative"
      title={!isExpanded ? "Clic para expandir" : "Clic para colapsar"} 
    >
      <p className={`text-slate-600 text-sm leading-relaxed transition-all duration-300 ${
        isExpanded ? '' : 'line-clamp-3' 
      }`}>
        "{text}"
      </p>
      
      {!isExpanded && text.length > 100 && (
        <span className="text-[10px] text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity block mt-1">
          ... ver más
        </span>
      )}
    </div>
  );
};

export default function SuggestionsTable({ data, loading }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-500 text-[11px] uppercase tracking-widest text-indigo-600 font-black bg-purple-100">
              <th className="px-6 py-5 whitespace-nowrap">Fecha / Turno</th>
              <th className="px-6 py-5 whitespace-nowrap">Mesero</th>
              <th className="px-6 py-5 text-center whitespace-nowrap">Mesa</th>
              <th className="px-6 py-5 min-w-[300px]">Sugerencia</th> 
              <th className="px-6 py-5 text-center whitespace-nowrap">Sentimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-400">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="h-24 bg-slate-50/20"></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center text-slate-400 text-sm italic">
                  No se encontraron comentarios
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                  {/* Columna: Fecha y Turno */}
                  <td className="px-6 py-4 align-top whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-700">
                      {new Date(item.date).toLocaleDateString('es-MX', { 
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                    <div className="text-xs font-bold text-cyan-600 mt-1 uppercase">
                      {item.shift}
                    </div>
                  </td>
                  
                  {/* Columna: Mesero */}
                  <td className="px-6 py-4 align-top whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {item.mesero?.charAt(0) || '?'}
                      </div>
                      <span className="font-bold text-slate-700 text-sm">
                        {item.mesero || 'Sin nombre'}
                      </span>
                    </div>
                  </td>

                  {/* Columna: Mesa */}
                  <td className="px-6 py-4 align-top text-center">
                    <span className="bg-slate-100 border border-slate-200 text-cyan-600 px-2 py-1 rounded-md font-bold text-xs">
                      #{item.table_number || '-'}
                    </span>
                  </td>
                  
                  {/* Columna: Sugerencia */}
                  <td className="px-6 py-4 align-top">
                    <ExpandableComment text={item.comment} />
                  </td>

                  {/* Columna: Sentimiento */}
                  <td className="px-6 py-4 text-center align-top">
                    <SentimentBadge sentiment={item.sentiment} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}