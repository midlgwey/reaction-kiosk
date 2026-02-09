import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function DailySatisfactionArea({ labels, dataValues }) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Promedio de satisfacción (%)',
        data: dataValues,
        fill: true,
        backgroundColor: 'rgba(129,141,248,0.3)', // color de relleno
        borderColor: '#818df8', // color de la línea
        tension: 0.3, // curva suave
        pointBackgroundColor: '#facc15',
        pointRadius: 5
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // permite que la gráfica se adapte al contenedor
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'black',
          font: { family: 'Inter, sans-serif', weight: 'normal', size: 12 },
        },
      },
      tooltip: {
        titleFont: { family: 'Inter, sans-serif', weight: '500', size: 12 },
        bodyFont: { family: 'Inter, sans-serif', weight: 'normal', size: 12 },
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}%`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: 'black',
          font: { family: 'Inter, sans-serif', weight: 'bold', size: 12 },
          stepSize: 10,
          callback: (value) => value + '%',
        },
      },
      x: {
        ticks: {
          color: 'black',
          font: { family: 'Inter, sans-serif', weight: 'bold', size: 12 },
        },
      },
    },
  };

  return (
    <div className="w-full h-80 md:h-96">
      <Line data={data} options={options} />
    </div>
  );
}