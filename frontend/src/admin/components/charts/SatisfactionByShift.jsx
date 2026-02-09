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
import { useShiftWeekChart } from "../../hooks/stats/useStatChart"; // Ajusta la ruta si es necesario

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SatisfactionByShiftChart() {
  const { labels, excelente, bueno, puede_mejorar, malo, loading, error } = useShiftWeekChart();

  if (loading || error || !labels.length) {
    /* ... (mismos manejos de carga/error que ya tienes) ... */
    return <div>Cargando...</div>;
  }

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Excelente",
        data: excelente,
        backgroundColor: "#14b8a6",
        stack: "stack-1", // LLAVE MAESTRA: El mismo ID de stack para todos
      },
      {
        label: "Bueno",
        data: bueno,
        backgroundColor: "#6366f1",
        stack: "stack-1",
      },
      {
        label: "Puede mejorar",
        data: puede_mejorar,
        backgroundColor: "#f59e0b",
        stack: "stack-1",
      },
      {
        label: "Malo",
        data: malo,
        backgroundColor: "#f43f5e",
        stack: "stack-1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "#000", font: { weight: 'bold' } } },
    },
    scales: {
      x: {
        // IMPORTANTE: stacked en FALSE para que Des y Com salgan uno al lado del otro
        stacked: false, 
        ticks: {
          color: "#000",
          font: { size: 11, weight: "bold" },
        },
        grid: { display: false }
      },
      y: {
        stacked: true, // El eje Y sí debe ser stacked para sumar los colores
        beginAtZero: true,
        ticks: { color: "#000", font: { weight: "bold" } },
      },
    },
  };

  return (
    <div className="w-full p-4 h-100 md:h-112">
      <Bar data={data} options={options} />
    </div>
  );
}