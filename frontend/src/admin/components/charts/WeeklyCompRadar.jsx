import React, { useState, useMemo } from 'react';
import Select from 'react-select';
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

// Registro de componentes requeridos por Chart.js para gráficos tipo Radar
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

/**
 * Componente funcional para mostrar estado de carga durante peticiones asíncronas.
 */
const ChartLoading = () => (
  <div className="h-80 w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando radar...</span>
  </div>
);

/**
 * Función utilitaria para generar los últimos 4 ciclos semanales.
 * Un ciclo semanal se define desde el martes más reciente hasta el lunes anterior.
 * * @returns {Array} Arreglo de objetos formateados para su uso en react-select y consultas a la API.
 */
const getRecentTuesdays = () => {
  const options = [];
  const today = new Date();
  
  let lastTuesday = new Date(today);
  const dayOfWeek = lastTuesday.getDay(); 
  
  // Normalización: Retroceso al martes más reciente
  if (dayOfWeek !== 2) {
      const daysToSubtract = dayOfWeek >= 2 ? dayOfWeek - 2 : dayOfWeek + 5;
      lastTuesday.setDate(lastTuesday.getDate() - daysToSubtract);
  }

  // Generación iterativa de 4 intervalos de 7 días
  for (let i = 0; i < 4; i++) {
      const start = new Date(lastTuesday);
      start.setDate(start.getDate() - (i * 7)); 
      
      const end = new Date(start);
      end.setDate(end.getDate() + 6); 

      const label = `${start.getDate()} ${start.toLocaleString('es-MX', {month:'short'})} - ${end.getDate()} ${end.toLocaleString('es-MX', {month:'short'})}`;
      const formatDB = (date) => date.toISOString().split('T')[0];

      options.push({
          value: `week_${i}`,
          label: i === 0 ? `Esta semana (${label})` : label,
          startDate: formatDB(start),
          endDate: formatDB(end)
      });
  }
  return options;
};

/**
 * Componente Principal: Renderiza un gráfico de Radar para comparar métricas
 * entre una semana seleccionada y su semana inmediatamente anterior.
 * Opera de forma independiente al filtro global de la página para garantizar
 * la comparación exclusiva de periodos cerrados de 7 días.
 */
export default function WeeklyCompRadar() {
  
  // Generación y almacenamiento en caché de las opciones del selector de semanas
  const selectOptions = useMemo(() => {
    const weeks = getRecentTuesdays();
    return [
      { value: '7days', label: 'Últimos 7 días', startDate: null, endDate: null },
      ...weeks
    ];
  }, []);

  // Estado que controla el periodo actualmente seleccionado para análisis
  const [selectedOption, setSelectedOption] = useState(selectOptions[0]);

  // Construcción del objeto de configuración para la petición HTTP
  const config = selectedOption.value === '7days' 
      ? { days: 7 } 
      : { startDate: selectedOption.startDate, endDate: selectedOption.endDate };

  // Invocación del hook personalizado para obtención de datos
  const radar = useWeeklyRadar(config);

  // Truncamiento de etiquetas extensas para mantener la integridad visual del canvas
  const shortLabels = radar.labels ? radar.labels.map(l => 
    l.length > 20 ? l.substring(0, 20) + "..." : l
  ) : [];

  // Estructuración de datos para inyección en Chart.js
  const data = {
    labels: shortLabels, 
    datasets: [
      {
        label: "Semana Seleccionada",
        data: radar.current,
        backgroundColor: "rgba(16, 185, 129, 0.2)", 
        borderColor: "#10b981",
        borderWidth: 2,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#10b981",
      },
      {
        label: "Semana Anterior",
        data: radar.last,
        backgroundColor: "rgba(99, 102, 241, 0.2)", 
        borderColor: "#6366f1",
        borderWidth: 2,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#6366f1",
        borderDash: [5, 5], 
      },
    ],
  };

  // Configuración de escalas, interacciones y renderizado general del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: true, color: "#cbd5e1" }, 
        grid: { color: "#cbd5e1" },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 25, display: false },
        pointLabels: {
          font: { family: "Inter, sans-serif", size: 11, weight: "bold" },
          color: "#000000", 
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: "Inter, sans-serif", size: 12, weight: "bold" }, 
          color: "#000000", 
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleFont: { family: "Inter", size: 13 },
        bodyFont: { family: "Inter", size: 12 },
        callbacks: {
            // Restauración de la etiqueta completa en el componente de tooltip
            title: (context) => {
                const index = context[0].dataIndex;
                return radar.labels[index]; 
            },
            label: (context) => ` ${context.dataset.label}: ${context.formattedValue}%`,
        },
      },
    },
  };

  // Definición de estilos base y estados de interacción para el componente react-select
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: '#e2e8f0',
      fontSize: '0.75rem',
      minHeight: '32px',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': { borderColor: '#6366f1' }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f5f3ff' : 'white',
      color: state.isSelected ? 'white' : '#475569',
      fontSize: '0.75rem',
      cursor: 'pointer',
    })
  };

  return (
     <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6  flex flex-col w-full h-full">
 
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
            Comparativa semanal de métricas 
          </h3>
      {/* Selector de rango de fechas */}
            <div className="flex justify-end items-center mb-4 relative z-10">
              <div className="w-full sm:w-60">
                <Select
                  options={selectOptions}
                  value={selectedOption}
                  onChange={(opt) => setSelectedOption(opt)}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>
            </div>

      </div>

      {/* Canvas de renderizado y manejo de estados vacíos/error */}
      <div className="flex-1 relative z-0 min-h-[300px]">
        {radar.loading ? (
          <ChartLoading />
        ) : radar.error ? (
          <div className="h-full flex items-center justify-center text-red-400 text-sm font-semibold">{radar.error}</div>
        ) : (!radar.labels || radar.labels.length === 0) ? (
          <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">No hay suficientes datos para comparar</div>
        ) : (
          <Radar data={data} options={options} />
        )}
      </div>
    </div>
  );
}