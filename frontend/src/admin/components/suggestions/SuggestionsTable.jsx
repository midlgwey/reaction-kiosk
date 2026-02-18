import React, { useState } from 'react';
import SentimentBadge from './SentimentBadge';

/**
 * Componente funcional para manejar la visualización de textos largos.
 * Permite alternar entre vista truncada (3 líneas) y vista completa mediante estado local.
 */
const ExpandableComment = ({ text }) => {
  // Estado para controlar la expansión del texto
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)} 
      className="cursor-pointer group relative"
      // Atributo title para mostrar el texto completo en hover (nativo del navegador)
      title={!isExpanded ? "Clic para expandir" : "Clic para colapsar"} 
    >
      {/* Condicional de clases CSS:
        - Si isExpanded es false: aplica 'line-clamp-3' (trunca a 3 líneas con elipsis).
        - Si isExpanded es true: elimina la clase para mostrar el contenido total.
      */}
      <p className={`text-slate-600 text-sm leading-relaxed transition-all duration-300 ${
        isExpanded ? '' : 'line-clamp-3' 
      }`}>
        "{text}"
      </p>
      
      {/* Indicador visual de "ver más". Solo se renderiza si el texto está colapsado y excede 100 caracteres */}
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
            <tr className="border-b border-slate-500 text-[11px] uppercase tracking-widest text-indigo-600 font-black bg-slate-50/50">
              <th className="px-6 py-5 whitespace-nowrap">Fecha</th>
              <th className="px-6 py-5 whitespace-nowrap">Turno</th>
              {/* min-w-[300px] asegura legibilidad en resoluciones medias evitando saltos de línea excesivos */}
              <th className="px-6 py-5 min-w-[300px]">Sugerencia</th> 
              <th className="px-6 py-5 text-center whitespace-nowrap">Sentimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-400">
            {/* 1. Estado de Carga: Renderiza Skeleton Loader */}
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="4" className="h-24 bg-slate-50/20"></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              // 2. Estado Vacío: Feedback visual si no hay registros
              <tr>
                <td colSpan="4" className="px-6 py-20 text-center text-slate-400 text-sm italic">
                  No se encontraron comentarios
                </td>
              </tr>
            ) : (
              // 3. Renderizado de Datos
              data.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-6 text-sm font-bold text-slate-700 whitespace-nowrap align-top">
                    {/* Formateo de fecha a local (MX) con hora y minutos */}
                    {new Date(item.date).toLocaleDateString('es-MX', { 
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                    })}
                  </td>
                  <td className="px-6 py-6 align-top">
                    <span className="font-bold text-slate-700 text-sm">{item.shift}</span>
                  </td>
                  
                  {/* Implementación del componente de texto expandible */}
                  <td className="px-6 py-6 align-top">
                    <ExpandableComment text={item.comment} />
                  </td>

                  <td className="px-6 py-6 text-center align-top">
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