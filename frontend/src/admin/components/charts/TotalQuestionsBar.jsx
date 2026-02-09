import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Asegúrate de que esta ruta sea la correcta según tu error anterior
import { useChartQuestionsWeek } from "../../hooks/stats/useStatChart";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function TotalQuestionsBar() {
  const chart = useChartQuestionsWeek();

  if (chart.loading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <p className="text-slate-500">Cargando gráfica...</p>
      </div>
    );
  }

  if (chart.error) {
    return (
      <div className="h-60 flex items-center justify-center">
        <p className="text-red-500">{chart.error}</p>
      </div>
    );
  }

  const data = {
    labels: chart.labels,
    datasets: [
      {
        label: "Excelente",
        data: chart.excelente,
        backgroundColor: "#14b8a6", // Verde
      },
      {
        label: "Bueno",
        data: chart.bueno,
        backgroundColor: "#6366f1", // Azul/Índigo
      },
      {
        label: "Puede mejorar",
        data: chart.puedeMejorar,
        backgroundColor: "#f59e0b", // Naranja/Amarillo
      },
      {
        label: "Malo",
        data: chart.malo,
        backgroundColor: "#f43f5e", // Rojo
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Permite que use el alto del div contenedor
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#000000",
          font: { weight: "bold" }
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#000000", // Color negro
          font: {
            weight: "bold", // Negrita
          },
        },
        grid: {
          display: false, // Limpia la vista quitando líneas verticales
        }
      },
      y: {
        ticks: {
          color: "#000000", // Color negro
          font: {
            weight: "bold", // Negrita
          },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    /* h-105 puede que no sea estándar en Tailwind, asegúrate de tenerla configurada o usa h-[400px] */
    <div className="w-full h-100 md:h-125">
      <Bar data={data} options={options} />
    </div>
  );
}