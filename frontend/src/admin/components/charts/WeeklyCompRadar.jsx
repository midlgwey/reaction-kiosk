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

export default function WeeklyCompRadar() {

  const radar = useWeeklyRadar();

  if (radar.loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-slate-500">Cargando radar...</p>
      </div>
    );
  }

  if (radar.error) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-red-500">{radar.error}</p>
      </div>
    );
  }

  if (!radar.labels.length) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-slate-400">Aún no hay datos suficientes</p>
      </div>
    );
  }

  const data = {
    labels: radar.labels,
    datasets: [
      {
        label: "Semana Actual",
        data: radar.current,
        backgroundColor: "rgba(167, 243, 208, 0.4)",
        borderColor: "#10b981",
        borderWidth: 2,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
      },
      {
        label: "Semana Pasada",
        data: radar.last,
        backgroundColor: "rgba(255, 237, 213, 0.5)",
        borderColor: "#fb923c",
        borderWidth: 2,
        pointBackgroundColor: "#fb923c",
        pointBorderColor: "#fff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          display: false,
        },
        pointLabels: {
          font: {
            family: "Inter, sans-serif",
            size: 12,
            weight: "bold",
          },
          color: "black",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "Inter, sans-serif",
            size: 12,
          },
          color: "black",
        },
      },
      tooltip: {
        titleFont: {
          family: "Inter, sans-serif",
          size: 12,
        },
        bodyFont: {
          family: "Inter, sans-serif",
          size: 12,
        },
        callbacks: {
          label: (context) =>
            ` ${context.dataset.label}: ${context.formattedValue}%`,
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
