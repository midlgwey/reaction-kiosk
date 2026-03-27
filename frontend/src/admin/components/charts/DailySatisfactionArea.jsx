import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  LineController, 
  BarController, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  LineController, 
  BarController, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

export default function DailySatisfactionArea({ labels, dataValues, volumeValues }) {
  const data = {
    labels,
    datasets: [
      {
        type: 'line',
        label: 'Satisfacción (%)',
        data: dataValues,
        fill: true,
        backgroundColor: 'rgba(129,141,248,0.2)',
        borderColor: '#818df8',
        tension: 0.3,
        pointBackgroundColor: 'rgba(190, 111, 177, 0.8)',
        yAxisID: 'y',
        zIndex: 2,
      },
      {
        type: 'bar',
        label: 'Total de Reacciones',
        data: volumeValues,
        backgroundColor: 'rgba(229, 185, 100, 0.8)',
        borderRadius: 8,
        yAxisID: 'y1',
        zIndex: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          color: '#000000', 
          font: {
            family: 'Inter, sans-serif',
            weight: 'bold'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: { // Eje de Porcentaje (Izquierdo)
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: 100,
        ticks: { 
          color: '#000000',
          font: { weight: 'bold' },
          callback: (value) => value + '%' 
        },
      },
      y1: { // Eje de Volumen (Derecho)
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        grid: { drawOnChartArea: false }, 
        ticks: { 
          color: '#000000', 
          font: { weight: 'bold' },
          beginAtZero: true 
        }
      },
      x: { // Eje X (Días)
        ticks: { 
          color: '#000000', 
          font: { weight: 'bold' } 
        }
      }
    },
  };

  return (
    <div className="w-full h-80 md:h-96">
      <Chart type='bar' data={data} options={options} />
    </div>
  );
}