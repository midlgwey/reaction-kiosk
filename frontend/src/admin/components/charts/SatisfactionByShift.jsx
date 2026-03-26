import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useShiftWeekChart } from "../../hooks/stats/useStatChart"; 
import DashboardFilter from "../shared/DashboardFilter"; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartLoading = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando métricas...</span>
  </div>
);

const STATS_OPTIONS = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '14', label: 'Últimas 2 semanas' },
  { value: '30', label: 'Último mes' },
  { value: 'custom', label: '📅 Elegir rango exacto' },
];

export default function SatisfactionByShift() {
  const [filterOption, setFilterOption] = useState(STATS_OPTIONS[0]);
  const [customDate, setCustomDate] = useState(new Date());

  const config = useMemo(() => {
    if (filterOption.value === 'custom') {
      const dateStr = format(customDate, 'yyyy-MM-dd');
      return { startDate: dateStr, endDate: dateStr };
    }
    return { days: Number(filterOption.value) };
  }, [filterOption, customDate]);

  const { labels, excelente, bueno, puede_mejorar, malo, loading, error } = useShiftWeekChart(config);

  const data = {
    labels: labels,
    datasets: [
      { label: "Excelente", data: excelente, backgroundColor: "#10b981", barThickness: 'flex', maxBarThickness: 35 },
      { label: "Bueno", data: bueno, backgroundColor: "#6366f1", barThickness: 'flex', maxBarThickness: 35 },
      { label: "Puede mejorar", data: puede_mejorar, backgroundColor: "#f59e0b", barThickness: 'flex', maxBarThickness: 35 },
      { label: "Malo", data: malo, backgroundColor: "#ef4444", barThickness: 'flex', maxBarThickness: 35, borderRadius: { topLeft: 4, topRight: 4 } },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, color: "#000", font: { weight: 'bold' } } },
    },
    scales: {
      x: { stacked: true, ticks: { color: "#000", font: { size: 11, weight: "bold" } }, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, ticks: { color: "#000", font: { weight: "bold" } }, grid: { color: "#cbd5e1" } },
    },
  };

  return (
    <div className="w-full flex flex-col h-100 md:h-112 p-4 pt-0">
      
      {/* Controles de encabezado con el filtro */}
      <div className="flex justify-end items-center mb-4 relative z-10">
        <DashboardFilter 
          options={STATS_OPTIONS} 
          selectedOption={filterOption} 
          setSelectedOption={setFilterOption} 
          selectedDay={customDate} 
          setSelectedDay={setCustomDate} 
        />
      </div>

      <div className="flex-1 relative z-0">
        {loading ? <ChartLoading /> : error ? (
           <div className="h-full flex items-center justify-center text-red-400 text-sm font-semibold">Error al cargar datos</div>
        ) : ( <Bar data={data} options={options} /> )}
      </div>
    </div>
  );
}