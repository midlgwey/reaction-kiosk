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
        type: 'line', // Especificamos que este es línea
        label: 'Satisfacción (%)',
        data: dataValues,
        fill: true,
        backgroundColor: 'rgba(129,141,248,0.2)',
        borderColor: '#818df8',
        tension: 0.3,
        pointBackgroundColor: '#facc15',
        yAxisID: 'y', // Eje izquierdo
        zIndex: 2, // Para que la línea quede arriba
      },
      {
        type: 'bar', // Especificamos que este es barra
        label: 'Total de Reacciones',
        data: volumeValues,
        backgroundColor: 'rgba(226, 232, 240, 0.6)',
        borderRadius: 8,
        yAxisID: 'y1', // Eje derecho (Volumen)
        zIndex: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
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
        ticks: { callback: (value) => value + '%' },
      },
      y1: { // Eje de Volumen (Derecho)
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        // Evita que las líneas de cuadrícula se encimen con el otro eje
        grid: { drawOnChartArea: false }, 
        ticks: { beginAtZero: true }
      },
    },
  };

  return (
    <div className="w-full h-80 md:h-96">
      <Chart type='bar' data={data} options={options} />
    </div>
  );
}