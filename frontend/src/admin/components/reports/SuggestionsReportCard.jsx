import React from 'react';
import { ChatBubbleLeftRightIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import { useSuggestionsList } from "../../hooks/feedback/useSuggestionsList";
import { downloadExcel } from "../../utils/excelExport";



export default function SuggestionsReportCard() {
  const { comments, loading } = useSuggestionsList();

  const handleDownload = () => {
    if (loading) return toast.error('Cargando datos...');
    if (!comments || comments.length === 0) return toast.error('No hay sugerencias para exportar');
    downloadExcel(comments, `Reporte_Sugerencias_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Reporte descargado');
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between h-full group">

      {/* Encabezado */}
      <div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-rose-50 text-rose-600">
          <ChatBubbleLeftRightIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">Buzón de Sugerencias</h3>
        <p className="text-slate-500 text-sm mb-4 leading-relaxed">
          Descarga el historial completo de comentarios con análisis de sentimiento, organizado por mes.
        </p>
      </div>

      {/* Botón */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-rose-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-800 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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