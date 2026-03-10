import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useChartQuestionsWeek } from "../../hooks/stats/useStatChart";
import DashboardFilter from "../shared/DashboardFilter"; // Ajusta la ruta si es diferente

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ChartLoading = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando gráfica...</span>
  </div>
);

const STATS_OPTIONS = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '14', label: 'Últimas 2 semanas' },
  { value: '30', label: 'Último mes' },
  { value: 'custom', label: '📅 Elegir rango exacto' },
];

export default function TotalQuestionsBar() {
  const [filterOption, setFilterOption] = useState(STATS_OPTIONS[0]);
  const [customDate, setCustomDate] = useState(new Date());

  const config = useMemo(() => {
    if (filterOption.value === 'custom') {
      const dateStr = format(customDate, 'yyyy-MM-dd');
      return { startDate: dateStr, endDate: dateStr };
    }
    return { days: Number(filterOption.value) };
  }, [filterOption, customDate]);

  const chart = useChartQuestionsWeek(config);

  const shortLabels = chart.labels ? chart.labels.map(l => l.length > 25 ? l.substring(0, 25) + "..." : l ) : [];

  const data = {
    labels: shortLabels, 
    datasets: [
      { label: "Excelente", data: chart.excelente, backgroundColor: "#10b981", barPercentage: 0.6 },
      { label: "Bueno", data: chart.bueno, backgroundColor: "#6366f1", barPercentage: 0.6 },
      { label: "Puede mejorar", data: chart.puedeMejorar, backgroundColor: "#f59e0b", barPercentage: 0.6 },
      { label: "Malo", data: chart.malo, backgroundColor: "#ef4444", barPercentage: 0.6, borderRadius: { topLeft: 4, topRight: 4 } },
    ],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { usePointStyle: true, boxWidth: 8, color: "#000000", font: { family: "Inter, sans-serif", weight: "bold", size: 12 } } },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)', titleColor: '#1e293b', bodyColor: '#475569', borderColor: '#e2e8f0',
        borderWidth: 1, titleFont: { size: 13, family: "Inter" }, bodyFont: { size: 12, family: "Inter" },
        callbacks: {
          title: (context) => { const index = context[0].dataIndex; return chart.labels[index]; },
          label: (context) => ` ${context.dataset.label}: ${context.raw} votos`
        }
      }
    },
    scales: {
      x: { stacked: true, ticks: { color: "#000000", font: { weight: "bold", size: 11 }, maxRotation: 45, minRotation: 0 }, grid: { display: false } },
      y: { stacked: true, ticks: { color: "#000000", font: { weight: "bold", size: 11 }, stepSize: 1 }, beginAtZero: true, grid: { color: "#cbd5e1" } },
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
        {chart.loading ? ( <ChartLoading /> ) : chart.error ? ( <div className="h-full flex items-center justify-center text-red-400 text-sm font-semibold">{chart.error}</div> ) : (!chart.labels || chart.labels.length === 0) ? ( <div className="h-full flex items-center justify-center text-slate-400 font-medium">No hay datos registrados en este periodo</div> ) : ( <Bar data={data} options={options} /> )}
      </div>
    </div>
  );
}