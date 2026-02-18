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

// Loader
const ChartLoading = () => (
  <div className="h-80 w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando radar...</span>
  </div>
);

export default function WeeklyCompRadar() {
  const radar = useWeeklyRadar();

  if (radar.loading) return <ChartLoading />;

  if (radar.error) {
    return (
      <div className="h-80 flex items-center justify-center text-red-400 text-sm font-semibold">
        {radar.error}
      </div>
    );
  }

  if (!radar.labels.length) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
        No hay suficientes datos para comparar
      </div>
    );
  }

  // Cortar etiquetas largas
  const shortLabels = radar.labels.map(l => 
    l.length > 20 ? l.substring(0, 20) + "..." : l
  );

  const data = {
    labels: shortLabels, 
    datasets: [
      {
        label: "Esta Semana",
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
        label: "Semana Pasada",
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        // Líneas que salen del centro
        angleLines: { 
            display: true, 
            color: "#cbd5e1" // Gris visible
        }, 
        // Círculos concéntricos (la rejilla)
        grid: { 
            color: "#cbd5e1" // Gris visible
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 25,
          display: false, 
        },
        // Etiquetas de las esquinas (Preguntas)
        pointLabels: {
          font: {
            family: "Inter, sans-serif",
            size: 11,
            weight: "bold", // Negrita
          },
          color: "#000000", // Negro puro
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: "Inter, sans-serif", size: 12, weight: "bold" }, // Negrita
          color: "#000000", // Negro puro
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
    <div className="w-full h-80 md:h-96">
      <Radar data={data} options={options} />
    </div>
  );
}