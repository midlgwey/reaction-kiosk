import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useChartQuestionsWeek } from "../../hooks/stats/useStatChart";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Componente de estado de carga
const ChartLoading = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando gráfica...</span>
  </div>
);

// Helper: Calcula los últimos 4 rangos semanales (de martes a lunes)
const getRecentTuesdays = () => {
  const options = [];
  const today = new Date();
  
  let lastTuesday = new Date(today);
  const dayOfWeek = lastTuesday.getDay(); 
  
  // Ajuste para retroceder al martes más reciente
  if (dayOfWeek !== 2) {
      const daysToSubtract = dayOfWeek >= 2 ? dayOfWeek - 2 : dayOfWeek + 5;
      lastTuesday.setDate(lastTuesday.getDate() - daysToSubtract);
  }

  // Generación de los rangos de fechas
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

export default function TotalQuestionsBar() {
  // Estado local para el filtro de fechas
  const [selectedRange, setSelectedRange] = useState(null);
  const weekOptions = useMemo(() => getRecentTuesdays(), []);

  // Configuración de la consulta de datos
  const config = selectedRange 
      ? { startDate: selectedRange.startDate, endDate: selectedRange.endDate } 
      : { days: 7 };

  // Ejecución del hook de datos
  const chart = useChartQuestionsWeek(config);

  // Formateo de etiquetas largas para evitar desbordamiento visual
  const shortLabels = chart.labels ? chart.labels.map(l => 
    l.length > 25 ? l.substring(0, 25) + "..." : l
  ) : [];

  // Configuración de los datasets de Chart.js
  const data = {
    labels: shortLabels, 
    datasets: [
      {
        label: "Excelente",
        data: chart.excelente,
        backgroundColor: "#10b981", 
        barPercentage: 0.6,
      },
      {
        label: "Bueno",
        data: chart.bueno,
        backgroundColor: "#6366f1", 
        barPercentage: 0.6,
      },
      {
        label: "Puede mejorar",
        data: chart.puedeMejorar,
        backgroundColor: "#f59e0b", 
        barPercentage: 0.6,
      },
      {
        label: "Malo",
        data: chart.malo,
        backgroundColor: "#ef4444", 
        barPercentage: 0.6,
        borderRadius: { topLeft: 4, topRight: 4 }, 
      },
    ],
  };

  // Opciones de renderizado y configuración visual de Chart.js
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          color: "#000000", 
          font: { family: "Inter, sans-serif", weight: "bold", size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleFont: { size: 13, family: "Inter" },
        bodyFont: { size: 12, family: "Inter" },
        callbacks: {
          // Restauración de la etiqueta completa en el tooltip
          title: (context) => {
             const index = context[0].dataIndex;
             return chart.labels[index]; 
          },
          label: (context) => ` ${context.dataset.label}: ${context.raw} votos`
        }
      }
    },
    scales: {
      x: {
        stacked: true, 
        ticks: {
          color: "#000000", 
          font: { weight: "bold", size: 11 },
          maxRotation: 45, 
          minRotation: 0,
        },
        grid: { display: false } 
      },
      y: {
        stacked: true, 
        ticks: {
          color: "#000000", 
          font: { weight: "bold", size: 11 },
          stepSize: 1, 
        },
        beginAtZero: true,
        grid: { color: "#cbd5e1" } 
      },
    },
  };

  return (
    <div className="w-full flex flex-col h-100 md:h-112 p-4">
      
      {/* Controles de encabezado y filtro */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700">Satisfacción por Pregunta</h3>
        
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

      {/* Renderizado condicional de la gráfica */}
      <div className="flex-1 relative">
        {chart.loading ? (
           <ChartLoading />
        ) : chart.error ? (
           <div className="h-full flex items-center justify-center text-red-400 text-sm font-semibold">{chart.error}</div>
        ) : (!chart.labels || chart.labels.length === 0) ? (
           <div className="h-full flex items-center justify-center text-slate-400 font-medium">No hay datos registrados en esta semana</div>
        ) : (
           <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
}