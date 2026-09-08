// frontend/src/admin/components/reports/TrendReportCard.jsx
import React, { useState, useEffect } from 'react';
import { PresentationChartLineIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import { useSalesReport } from '../../hooks/sales/useSalesReports';
import { downloadSalesExcel } from '../../utils/salesExport';

const MONTH_OPTIONS = [
  { label: 'Agosto 2026',     value: '08' },
  { label: 'Septiembre 2026', value: '09' },
  { label: 'Octubre 2026',    value: '10' },
];

export default function TrendReportCard() {
  const { dashboard, loading, error, fetchDashboard } = useSalesReport();
  const [selectedMonth, setSelectedMonth] = useState('08');
  const [isDownloading, setIsDownloading] = useState(false);

  // Cargar datos al montar y al cambiar el mes
  useEffect(() => {
    fetchDashboard(selectedMonth).catch(() => {});
  }, [selectedMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = () => {
    if (loading || isDownloading) return;
    if (!dashboard || !dashboard.employees?.length) {
      return toast.error('No hay datos de ventas para este mes');
    }
    setIsDownloading(true);
    downloadSalesExcel(dashboard, selectedMonth);
    toast.success('Reporte descargado');
    setTimeout(() => setIsDownloading(false), 2000);
  };

  // Mini preview — top vendedor del mes
  const topSeller = dashboard?.employees
    ? [...dashboard.employees].sort((a, b) => Number(b.month_sold) - Number(a.month_sold))[0]
    : null;

  const monthLabel = MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label || '';

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between h-full group">

      {/* Encabezado */}
      <div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-indigo-50 text-indigo-600">
          <PresentationChartLineIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">Reporte de Chiles en Nogada</h3>
        <p className="text-slate-500 text-sm mb-4 leading-relaxed">
          Exporta el rendimiento mensual con rankings, récords y semáforo de cada colaborador.
        </p>

        {/* Select de mes */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Seleccionar mes
          </label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            {MONTH_OPTIONS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
       
        {/* Error */}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

        {/* Sin datos */}
        {!loading && !dashboard && !error && (
          <p className="text-xs text-slate-400 italic">Sin datos para este mes.</p>
        )}
      </div>

      {/* Botón */}
      <button
        onClick={handleDownload}
        disabled={loading || !dashboard || isDownloading}
        className="w-full py-3.5 rounded-xl bg-indigo-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-800 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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