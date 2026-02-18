import React from 'react';
import { ChartBarIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';

// Importación de capa de datos y utilidad de exportación
import { useChartQuestionsWeek } from "../../../admin/hooks/stats/useStatChart"; 
import { downloadExcel } from "../../../admin/utils/excelExport";

export default function QuestionsReportCard() {
  
  // Solicitud de métricas para ventana mensual (30 días).
  // Nota: Se destructura 'puedeMejorar' tal como viene definido en el hook original.
  const { labels, excelente, bueno, puedeMejorar, malo, loading } = useChartQuestionsWeek(30);

  /**
   * Procesa los arrays paralelos de sentimientos y genera el archivo Excel.
   */
  const handleDownload = () => {
    // Validación de estado de carga y existencia de datos
    if (loading) return toast.error("Procesando datos...");
    if (!labels || labels.length === 0) return toast.error("Sin datos de preguntas");

    // Transformación de datos:
    // Itera sobre el array de preguntas (labels) y recupera los valores de los arrays de conteo usando el índice.
    const dataExcel = labels.map((pregunta, index) => {
      
      const v_excelente = excelente[index] || 0;
      const v_bueno = bueno[index] || 0;
      const v_puedeMejorar = puedeMejorar[index] || 0;
      const v_malo = malo[index] || 0;

      const total = v_excelente + v_bueno + v_puedeMejorar + v_malo;

      // Cálculo de Score Promedio (Base 4)
      // Fórmula: Sumatoria de (Votos * Peso) / Total de Votos
      let promedio = 0;
      if (total > 0) {
        promedio = ((v_excelente * 4) + (v_bueno * 3) + (v_puedeMejorar * 2) + (v_malo * 1)) / total;
      }

      return {
        "Pregunta / Área": pregunta,
        "Excelente (4)": v_excelente,
        "Bueno (3)": v_bueno,
        "Regular (2)": v_puedeMejorar,
        "Malo (1)": v_malo,
        "Total Votos": total,
        "Puntaje Promedio": total > 0 ? Number(promedio).toFixed(2) : "0.00"
      };
    });

    // Ejecución de descarga
    downloadExcel(dataExcel, `Reporte_Preguntas_Mensual_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success("Reporte de Preguntas descargado");
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between h-full group">
        
        {/* Encabezado Informativo */}
        <div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors bg-emerald-50 text-emerald-600 ">
                <ChartBarIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Análisis por Pregunta</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Detalle de votación desglosado por cada pregunta activa en el cuestionario.
            </p>
        </div>
        
        {/* Botón de Acción */}
        <button 
            onClick={handleDownload}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-800 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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