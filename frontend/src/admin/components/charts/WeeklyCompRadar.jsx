import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { useWeeklyRadar } from "../../hooks/stats/useStatChart";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// Componente indicador de carga
const ChartLoading = () => (
  <div className="h-80 w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando radar...</span>
  </div>
);

// Helper: Genera los rangos de fechas (martes a lunes) para las últimas 4 semanas
const getRecentTuesdays = () => {
  const options = [];
  const today = new Date();
  
  let lastTuesday = new Date(today);
  const dayOfWeek = lastTuesday.getDay(); 
  
  // Retroceder al martes más reciente
  if (dayOfWeek !== 2) {
      const daysToSubtract = dayOfWeek >= 2 ? dayOfWeek - 2 : dayOfWeek + 5;
      lastTuesday.setDate(lastTuesday.getDate() - daysToSubtract);
  }

  // Generación de 4 rangos semanales consecutivos hacia atrás
  for (let i = 0; i < 4; i++) {
      const start = new Date(lastTuesday);
      start.setDate(start.getDate() - (i * 7)); 
      
      const end = new Date(start);
      end.setDate(end.getDate() + 6); 

      const label = `${start.getDate()} ${start.toLocaleString('es-MX', {month:'short'})} - ${end.getDate()} ${end.toLocaleString('es-MX', {month:'short'})}`;
      const formatDB = (date) => date.toISOString().split('T')[0];

      options.push({
          label: i === 0 ? `Esta semana (${label})` : label,
          startDate: formatDB(start),
          endDate: formatDB(end)
      });
  }
  return options;
};

export default function WeeklyCompRadar() {
  // Estado local para almacenar el rango de fechas seleccionado
  const [selectedRange, setSelectedRange] = useState(null);
  const weekOptions = useMemo(() => getRecentTuesdays(), []);

  // Configuración de parámetros para la consulta de datos
  const config = selectedRange 
      ? { startDate: selectedRange.startDate, endDate: selectedRange.endDate } 
      : { days: 7 };

  // Ejecución del hook de datos
  const radar = useWeeklyRadar(config);

  // Formateo de etiquetas para prevenir desbordamiento visual
  const shortLabels = radar.labels ? radar.labels.map(l => 
    l.length > 20 ? l.substring(0, 20) + "..." : l
  ) : [];

  // Configuración de los datasets para Chart.js
  const data = {
    labels: shortLabels, 
    datasets: [
      {
        label: "Semana Seleccionada",
        data: radar.current,
        backgroundColor: "rgba(16, 185, 129, 0.2)", 
        borderColor: "#10b981",
        borderWidth: 2,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#10b981",
      },
      {
        label: "Semana Anterior",
        data: radar.last,
        backgroundColor: "rgba(99, 102, 241, 0.2)", 
        borderColor: "#6366f1",
        borderWidth: 2,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#6366f1",
        borderDash: [5, 5], 
      },
    ],
  };

  // Configuración de escalas, tooltips y opciones de diseño
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { 
            display: true, 
            color: "#cbd5e1" 
        }, 
        grid: { 
            color: "#cbd5e1" 
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 25,
          display: false, 
        },
        pointLabels: {
          font: {
            family: "Inter, sans-serif",
            size: 11,
            weight: "bold", 
          },
          color: "#000000", 
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: "Inter, sans-serif", size: 12, weight: "bold" }, 
          color: "#000000", 
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleFont: { family: "Inter", size: 13 },
        bodyFont: { family: "Inter", size: 12 },
        callbacks: {
            // Despliega la pregunta completa en el tooltip
            title: (context) => {
                const index = context[0].dataIndex;
                return radar.labels[index]; 
            },
            label: (context) => ` ${context.dataset.label}: ${context.formattedValue}%`,
        },
      },
    },
  };

  return (
    <div className="w-full flex flex-col h-100 md:h-112 p-4">
      
      {/* Controles de encabezado y filtro de fechas */}
      <div className="flex justify-between items-center mb-4">
        
        <select 
          className="text-xs bg-gray-50 border border-gray-300 text-gray-700 rounded-lg p-2 font-medium cursor-pointer focus:ring-indigo-500 focus:border-indigo-500"
          onChange={(e) => {
              if (e.target.value === "7days") {
                  setSelectedRange(null);
              } else {
                  setSelectedRange(weekOptions[e.target.value]);
              }
          }}
        >
          <option value="7days">Últimos 7 días</option>
          {weekOptions.map((opt, index) => (
             <option key={index} value={index}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Área de renderizado de la gráfica con manejo de estados */}
      <div className="flex-1 relative">
        {radar.loading ? (
          <ChartLoading />
        ) : radar.error ? (
          <div className="h-full flex items-center justify-center text-red-400 text-sm font-semibold">{radar.error}</div>
        ) : (!radar.labels || radar.labels.length === 0) ? (
          <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">No hay suficientes datos para comparar</div>
        ) : (
          <Radar data={data} options={options} />
        )}
      </div>
    </div>
  );
}