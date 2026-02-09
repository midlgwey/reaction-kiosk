import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Registrar componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function SentimentDistributionDoughnut({ dataValues, labels }) {
  // Ejemplo de datos por defecto
  const data = {
    labels: labels || ["Excelente", "Buena", "Puede mejorar", "Mala"],
    datasets: [
      {
        label: "Respuestas",
        data: dataValues || [12, 19, 7, 3], // reemplaza por tus datos
        backgroundColor: [
          "#14b8a6", // verde
          "#6366f1", // amarillo
          "#f59e0b", // naranja
          "#f43f5e", // rojo
        ],
         borderColor: ["#fff", "#fff", "#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#374151", // texto gris oscuro
          font: {
            size: 14,
          },
        },
      },
    },
    cutout: "60%", // tamaño del agujero central
  };

  return <Doughnut data={data} options={options} />;
}
