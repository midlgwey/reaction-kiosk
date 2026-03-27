import { format } from "date-fns";
 
// ─── Opciones del filtro ───────────────────────────────────────────────────────
 
export const AREA_OPTIONS = [
  { value: "7",   label: "Última Semana" },
  { value: "14",  label: "Últimas 2 Semanas" },
  { value: "21",  label: "Últimas 3 Semanas" },
  { value: "30",  label: "Último Mes" },
  { value: "90",  label: "Últimos 3 Meses" },
  { value: "180", label: "Últimos 6 Meses" },
];
 
// ─── Transformación de datos ──────────────────────────────────────────────────
 
export function buildAreaChartData(trendData = [], days) {
  const labels = trendData.map(({ day }) => {
    const [year, month, dayNum] = day.split("-");
    const date = new Date(year, month - 1, dayNum);
    return days > 7
      ? format(date, "dd MMM")
      : date.toLocaleDateString("es-MX", { weekday: "long" });
  });
 
  return {
    labels,
    values: trendData.map((d) => Math.round((d.avg_satisfaction / 4) * 100)),
    counts: trendData.map((d) => d.total_responses),
  };
}
 
// ─── Configuración de Chart.js ────────────────────────────────────────────────
 
export function buildChartDataset(labels, dataValues, volumeValues) {
  return {
    labels,
    datasets: [
      {
        type: "line",
        label: "Satisfacción (%)",
        data: dataValues,
        fill: true,
        backgroundColor: "rgba(129,141,248,0.2)",
        borderColor: "#818df8",
        tension: 0.3,
        pointBackgroundColor: "rgba(190, 111, 177, 0.8)",
        yAxisID: "y",
        zIndex: 2,
      },
      {
        type: "bar",
        label: "Total de Reacciones",
        data: volumeValues,
        backgroundColor: "rgba(229, 185, 100, 0.8)",
        borderRadius: 8,
        yAxisID: "y1",
        zIndex: 1,
      },
    ],
  };
}
 
export const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#000000",
        font: { family: "Inter, sans-serif", weight: "bold" },
      },
    },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    y: {
      type: "linear",
      display: true,
      position: "left",
      min: 0,
      max: 100,
      ticks: {
        color: "#000000",
        font: { weight: "bold" },
        callback: (value) => value + "%",
      },
    },
    y1: {
      type: "linear",
      display: true,
      position: "right",
      min: 0,
      grid: { drawOnChartArea: false },
      ticks: { color: "#000000", font: { weight: "bold" }, beginAtZero: true },
    },
    x: {
      ticks: { color: "#000000", font: { weight: "bold" } },
    },
  },
};
 