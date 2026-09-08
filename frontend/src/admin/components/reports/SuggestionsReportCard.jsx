// frontend/src/admin/components/reports/SuggestionsReportCard.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import { useSuggestionsList } from "../../hooks/feedback/useSuggestionsList";
import { downloadExcel, getAvailableMonths } from "../../utils/excelExport";

export default function SuggestionsReportCard() {
  const { comments, loading } = useSuggestionsList();
  const [selectedKey, setSelectedKey]     = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Meses disponibles — solo los que tienen comentarios
  const availableMonths = useMemo(() => getAvailableMonths(comments), [comments]);

  // Seleccionar el más reciente por defecto cuando cargan los datos
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedKey) {
      setSelectedKey(availableMonths[0].key);
    }
  }, [availableMonths]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = () => {
    if (loading || isDownloading) return;
    if (!selectedKey) return toast.error('Selecciona un mes para descargar');
    if (!comments || comments.length === 0) return toast.error('No hay sugerencias para exportar');

    const month = availableMonths.find(m => m.key === selectedKey);
    setIsDownloading(true);
    downloadExcel(comments, selectedKey, `Reporte_Sugerencias_${month?.label || selectedKey}.xlsx`);
    toast.success('Reporte descargado');
    setTimeout(() => setIsDownloading(false), 2000);
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
          Descarga el reporte mensual de comentarios con análisis de sentimiento y detalle por mesero.
        </p>

        {/* Select de mes */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Seleccionar mes
          </label>
          {loading ? (
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ) : availableMonths.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Sin datos disponibles</p>
          ) : (
            <select
              value={selectedKey}
              onChange={e => setSelectedKey(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
            >
              {availableMonths.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Botón */}
      <button
        onClick={handleDownload}
        disabled={loading || !selectedKey || availableMonths.length === 0 || isDownloading}
        className="w-full py-3.5 rounded-xl bg-rose-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-800 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading || isDownloading ? (
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