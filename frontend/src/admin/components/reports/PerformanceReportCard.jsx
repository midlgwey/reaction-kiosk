import React, { useState } from 'react';
import { ChartBarSquareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useWaiterPerformance } from '../../hooks/waiters/useWaiterPerformance';
import { usePeriodFilter } from '../../hooks/shared/usePeriodFilter';
import PeriodSelector from '../shared/PeriodSelector';
import { downloadPerformanceExcel } from '../../utils/performanceExcelExport';

export default function PerformanceReportCard() {
  const { selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, yearOptions } = usePeriodFilter();
  const { data, loading, error } = useWaiterPerformance(selectedMonth.value, selectedYear);
  const [isDownloading, setIsDownloading] = useState(false);

  const monthLabel = selectedMonth.label ?? selectedMonth.value;
  const conCaptura = data.filter(m => m.captadas > 0 || m.mesas_reales > 0).length;

  const handleDownload = () => {
    if (loading || isDownloading) return;
    if (error)              return toast.error('No se pudo cargar el reporte');
    if (data.length === 0)  return toast.error('No hay datos para este periodo');

    setIsDownloading(true);
    downloadPerformanceExcel(data, monthLabel, selectedYear);
    toast.success('Reporte descargado');
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between h-full group">

      <div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-indigo-50 text-emerald-800">
          <ChartBarSquareIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">Rendimiento de Meseros</h3>
        <p className="text-slate-500 text-sm mb-4 leading-relaxed">
          Descarga el reporte mensual con encuestas, cumplimiento y resultado final por mesero.
        </p>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Seleccionar periodo
          </label>
          <PeriodSelector
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            yearOptions={yearOptions}
          />
          {!loading && !error && (
            <p className="text-xs text-slate-400 mt-2">
              {data.length === 0
                ? 'Sin datos para este periodo'
                : `${data.length} meseros · ${conCaptura} con actividad`}
            </p>
          )}
          {error && <p className="text-xs text-rose-500 mt-2 font-semibold">{error}</p>}
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={loading || !!error || data.length === 0 || isDownloading}
        className="w-full py-3.5 rounded-xl bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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