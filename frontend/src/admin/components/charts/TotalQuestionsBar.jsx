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

// El mismo loader que usamos en las otras, para que se vea igual
const ChartLoading = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando gráfica...</span>
  </div>
);

export default function TotalQuestionsBar() {
  const chart = useChartQuestionsWeek();

  // Si está cargando, ponemos el skeleton
  if (chart.loading) {
    return (
      <div className="w-full h-96">
        <ChartLoading />
      </div>
    );
  }

  // Si tronó algo, mostramos el error
  if (chart.error) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-red-400 text-sm font-semibold">{chart.error}</p>
      </div>
    );
  }

  // Si no hay nada de nada, avisamos
  if (!chart.labels || chart.labels.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-slate-400">No hay datos registrados esta semana</p>
      </div>
    );
  }

  // Cortamos el texto si se pasa de lanza (25 chars) para que no rompa el diseño abajo
  const shortLabels = chart.labels.map(l => 
    l.length > 25 ? l.substring(0, 25) + "..." : l
  );

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
        borderRadius: { topLeft: 4, topRight: 4 }, // Redondeo coqueto arriba
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          color: "#000000", // Negro para que se lea bien
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
          // Aquí mostramos la pregunta COMPLETA cuando pasas el mouse
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
        stacked: true, // Apilamos para ver el total por barra
        ticks: {
          color: "#000000", // Texto negro
          font: { weight: "bold", size: 11 },
          maxRotation: 45, 
          minRotation: 0,
        },
        grid: { display: false } // Sin grid vertical o rayas verticales
      },
      y: {
        stacked: true, 
        ticks: {
          color: "#000000", // Texto negro
          font: { weight: "bold", size: 11 },
          stepSize: 1, // Numeros enteros, nada de 1.5 votos
        },
        beginAtZero: true,
        //Color del grid o rayas horizontales
        grid: { color: "#cbd5e1" } 
      },
    },
  };

  return (
    <div className="w-full h-96">
      <Bar data={data} options={options} />
    </div>
  );
}