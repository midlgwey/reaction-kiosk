import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useShiftWeekChart } from "../../hooks/stats/useStatChart"; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartLoading = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando métricas...</span>
  </div>
);

// Función que calcula los 4 martes anteriores
const getRecentTuesdays = () => {
  const options = [];
  const today = new Date();
  
  let lastTuesday = new Date(today);
  const dayOfWeek = lastTuesday.getDay(); 
  
  if (dayOfWeek !== 2) {
      const daysToSubtract = dayOfWeek >= 2 ? dayOfWeek - 2 : dayOfWeek + 5;
      lastTuesday.setDate(lastTuesday.getDate() - daysToSubtract);
  }

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

export default function SatisfactionByShiftChart() {
  const [selectedRange, setSelectedRange] = useState(null);
  const weekOptions = useMemo(() => getRecentTuesdays(), []);

  const config = selectedRange 
      ? { startDate: selectedRange.startDate, endDate: selectedRange.endDate } 
      : { days: 7 };

  const { labels, excelente, bueno, puede_mejorar, malo, loading, error } = useShiftWeekChart(config);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Excelente",
        data: excelente,
        backgroundColor: "#10b981", 
        barThickness: 'flex',       
        maxBarThickness: 35,        
      },
      {
        label: "Bueno",
        data: bueno,
        backgroundColor: "#6366f1", 
        barThickness: 'flex',
        maxBarThickness: 35,
      },
      {
        label: "Puede mejorar",
        data: puede_mejorar,
        backgroundColor: "#f59e0b", 
        barThickness: 'flex',
        maxBarThickness: 35,
      },
      {
        label: "Malo",
        data: malo,
        backgroundColor: "#ef4444", 
        barThickness: 'flex',
        maxBarThickness: 35,
        borderRadius: { topLeft: 4, topRight: 4 }
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom", 
        labels: { 
          usePointStyle: true,
          boxWidth: 8,        
          color: "#000", 
          font: { weight: 'bold' } 
        } 
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: "#000", font: { size: 11, weight: "bold" } },
        grid: { display: false }
      },
      y: {
        stacked: true, 
        beginAtZero: true,
        ticks: { color: "#000", font: { weight: "bold" } },
        grid: { color: "#cbd5e1" } 
      },
    },
  };

  return (
    <div className="w-full flex flex-col h-100 md:h-112 p-4">
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

      <div className="flex-1 relative">
        {loading ? (
           <ChartLoading />
        ) : error ? (
           <div className="h-full flex items-center justify-center text-red-400 text-sm font-semibold">Error al cargar datos</div>
        ) : (
           <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
}