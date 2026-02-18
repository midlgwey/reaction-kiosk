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

// Helpers
const ChartLoading = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando métricas...</span>
  </div>
);

export default function SatisfactionByShiftChart() {
  const { labels, excelente, bueno, puede_mejorar, malo, loading, error } = useShiftWeekChart();

  // Carga el helper
  if (loading) {
    return (
      <div className="w-full p-4 h-100 md:h-112">
        <ChartLoading />
      </div>
    );
  }

  // Muestra error
  if (error) return <div className="h-80 flex items-center justify-center text-red-400 text-sm font-semibold">Error al cargar datos</div>;

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
        borderRadius: { topLeft: 4, topRight: 4 } // Redondeo solo arriba de la pila
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
          usePointStyle: true, // Esto hace que sean círculos en vez de rectángulos
          boxWidth: 8,         // Tamaño del círculo
          color: "#000", 
          font: { weight: 'bold' } 
        } 
      },
    },
    scales: {
      x: {
        stacked: true, // Apilado horizontal
        ticks: {
          color: "#000",
          font: { size: 11, weight: "bold" },
        },
        grid: { display: false }
      },
      y: {
        stacked: true, 
        beginAtZero: true,
        ticks: { color: "#000", font: { weight: "bold" } },
        grid: { color: "#cbd5e1" } // Color gris visible para las líneas de fondo
      },
    },
  };

  return (
    <div className="w-full p-4 h-100 md:h-112">
      <Bar data={data} options={options} />
    </div>
  );
}