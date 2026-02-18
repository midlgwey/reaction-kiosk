import React from 'react';
import { PresentationChartLineIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';

// Importación de capa de datos y utilidades de exportación
import { useDailySatisfactionTrend } from "../../..//admin/hooks/dashboard/useDashboardWeekly";
import { downloadExcel } from "../../../admin/utils/excelExport";

export default function TrendReportCard() {

  // Extracción de datos históricos (ventana de 30 días) mediante hook personalizado.
  const { data, loading } = useDailySatisfactionTrend(30);

  /**
   * Manejador del evento de descarga.
   * Valida el estado, transforma los datos crudos y ejecuta la exportación a Excel.
   */
  const handleDownload = () => {
    // Validaciones preventivas de estado
    if (loading) return toast.error("Calculando métricas...");
    if (!data || data.length === 0) return toast.error("No hay datos de tendencia");

    // Transformación de datos: Adaptación del modelo de base de datos a filas de Excel
    const dataExcel = data.map(item => {

        //Si no hay datps muestra NA
        if (Number(item.total_responses) === 0) {
        return {
            "Fecha": item.day,
            "Puntaje (1-4)": "N/A", // Indica ausencia de métrica
            "Satisfacción (%)": "0%",
            "Total Votos": 0,
            "Estatus": "Sin Actividad ⚪" // Diferenciación visual para días inactivos
        };
      }

      // Normalización de la métrica de satisfacción (base 4) a porcentaje (0-100)
      const porcentaje = Math.round((item.avg_satisfaction / 4) * 100);

      // Clasificación cualitativa basada en umbrales de negocio predefinidos
      let estatus = 'Regular';
      if (porcentaje >= 90) estatus = 'Excelente 🤩';
      else if (porcentaje >= 75) estatus = 'Bueno 🙂';
      else if (porcentaje >= 50) estatus = 'Requiere Atención ⚠️';
      else estatus = 'Crítico 🚨';

      // Construcción del objeto fila para la librería xlsx
      return {
        "Fecha": item.day, // Formato esperado: YYYY-MM-DD
        "Puntaje (1-4)": Number(item.avg_satisfaction).toFixed(2),
        "Satisfacción (%)": `${porcentaje}%`,
        "Total Votos": item.total_responses,
        "Estatus": estatus
      };
    });

    // Ejecución de la utilidad de exportación con timestamp dinámico en el nombre del archivo
    downloadExcel(dataExcel, `Reporte_Tendencia_Mensual_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success("Reporte de Tendencia descargado");
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between h-full group">

        {/* Bloque informativo de la tarjeta */}
        <div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors bg-indigo-50 text-indigo-600 ">
                <PresentationChartLineIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tendencia de Satisfacción</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Exporta el comportamiento diario de la grafica de área de los últimos 30 días.
            </p>
        </div>

        {/* Botón de acción con gestión de estado de carga */}
        <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-800 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                // Indicador visual de procesamiento (Spinner)
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