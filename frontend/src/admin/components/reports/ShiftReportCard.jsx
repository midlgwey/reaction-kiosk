import React from 'react';
import { ClockIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';

// Importación de hooks de estadísticas y utilidad de exportación
import { useShiftWeekChart } from "../../../admin/hooks/stats/useStatChart"; 
import { downloadExcel } from "../../../admin/utils/excelExport";

export default function ShiftReportCard() {
  
  // Solicitud de métricas para un periodo mensual (30 días).
  // Nota: El hook retorna arrays paralelos (labels, excelente, bueno, etc.) alineados por índice.
  const { labels, excelente, bueno, puede_mejorar, malo, loading } = useShiftWeekChart(30);

  /**
   * Ejecuta la transformación de datos y la descarga del archivo.
   */
  const handleDownload = () => {
    // Validaciones de estado y disponibilidad de datos
    if (loading) return toast.error("Cargando datos...");
    if (!labels || labels.length === 0) return toast.error("Sin datos de turnos");

    // Transformación de datos:
    // Se itera sobre el array principal 'labels' y se accede a los valores 
    // correspondientes en los arrays de métricas utilizando el índice actual.
    const dataExcel = labels.map((labelInfo, index) => {
      
      // Normalización de la etiqueta:
      // El hook puede retornar un array [Fecha, CódigoTurno] o un string simple.
      const dia = Array.isArray(labelInfo) ? labelInfo[0] : labelInfo;
      const turnoCodigo = Array.isArray(labelInfo) ? labelInfo[1] : 'N/A';
      
      // Decodificación de identificadores de turno a nombres legibles para el reporte
      const nombreTurno = turnoCodigo === 'Des' ? 'Desayuno ☕' : 'Comida 🍔';

      // Extracción de valores numéricos de los arrays paralelos
      const v_excelente = excelente[index] || 0;
      const v_bueno = bueno[index] || 0;
      const v_regular = puede_mejorar[index] || 0;
      const v_malo = malo[index] || 0;

      // Cálculo de totales
      const total = v_excelente + v_bueno + v_regular + v_malo;

      // Cálculo de Promedio Ponderado (Score):
      // Fórmulación: (4*Exc + 3*Bue + 2*Reg + 1*Mal) / Total Votos
      let promedio = 0;
      if (total > 0) {
        promedio = ( (v_excelente * 4) + (v_bueno * 3) + (v_regular * 2) + (v_malo * 1) ) / total;
      }

      // Construcción de la fila para el archivo Excel
      return {
        "Fecha / Día": dia,
        "Turno": nombreTurno,
        "Excelente (4)": v_excelente,
        "Bueno (3)": v_bueno,
        "Regular (2)": v_regular,
        "Malo (1)": v_malo,
        "Total Votos": total,
        "Calif. Promedio": total > 0 ? Number(promedio).toFixed(2) : "0.00"
      };
    });

    // Generación del archivo Excel
    downloadExcel(dataExcel, `Reporte_Turnos_Mensual_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success("Reporte de Turnos descargado");
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between h-full group">
        
        {/* Sección de encabezado e información */}
        <div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors bg-orange-50 text-orange-600  ">
                <ClockIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Desempeño por Turnos</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Exporta la satisfacción entre el turno de Desayuno y Comida de los utilmos 30 días
            </p>
        </div>
        
        {/* Control de descarga */}
        <button 
            onClick={handleDownload}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-orange-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-800 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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