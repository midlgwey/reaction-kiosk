import React from 'react';
import { ChatBubbleLeftRightIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import { useSuggestionsList } from "../../hooks/feedback/useSuggestionsList"
import { downloadExcel } from "../../utils/excelExport";

export default function SuggestionsReportCard() {
  
  const { comments, loading } = useSuggestionsList();

  const handleDownload = () => {
    if (loading) return toast.error("Cargando datos...");
    if (!comments || comments.length === 0) return toast.error("No hay sugerencias para exportar");

    // Transformacion de datos
    // JSON a Excel
    const dataExcel = comments.map(item => {
      
      // Lógica para traducir el sentimiento 
      const sentimentLabel = {
        'Positive': 'Positivo',
        'Negative': 'Negativo',
        'Neutral':  'Neutral'
      }[item.sentiment] || 'Neutral';

      return {
        "Fecha": new Date(item.date).toLocaleDateString('es-MX'),
        "Hora": new Date(item.date).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'}),
        "Turno": item.shift,
        "Sentimiento": sentimentLabel, 
        "Sugerencia": item.comment     
      };
    });

    downloadExcel(dataExcel, `Reporte_Sugerencias_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success("Reporte descargado");
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between h-full group">
        
        {/* Encabezado de la tarjeta */}
        <div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors bg-rose-50 text-rose-600  ">
                <ChatBubbleLeftRightIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Buzón de Sugerencias</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Descarga el listado completo de comentarios y su análisis de sentimiento.
            </p>
        </div>
        
        {/* Botón de Acción */}
        <button 
            onClick={handleDownload}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-rose-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-800 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            ) : (
                <>
                    <ArrowDownTrayIcon className="w-5 h-5" /> 
                    Descargar Excel
                </>
            )}
        </button>
    </div>
  );
}