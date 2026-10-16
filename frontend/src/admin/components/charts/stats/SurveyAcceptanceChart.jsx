import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useSurveyAcceptance } from '../../../hooks/stats/useStatChart';
import DashboardFilter from '../../shared/DashboardFilter';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STATS_OPTIONS = [
  { value: '7',      label: 'Últimos 7 días' },
  { value: '14',     label: 'Últimas 2 semanas' },
  { value: '30',     label: 'Último mes' },
  { value: 'custom', label: '📅 Elegir rango exacto' },
];

const ChartLoading = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3" />
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando datos...</span>
  </div>
);

export default function SurveyAcceptanceChart() {
  const [filterOption, setFilterOption] = useState(STATS_OPTIONS[0]);
  const [customDate, setCustomDate] = useState(new Date());

  const config = useMemo(() => {
    if (filterOption.value === 'custom') {
      const dateStr = format(customDate, 'yyyy-MM-dd');
      return { startDate: dateStr, endDate: dateStr };
    }
    return { days: Number(filterOption.value) };
  }, [filterOption, customDate]);

  const { days, totals, loading, error } = useSurveyAcceptance(config);

  const chartData = {
    labels: days.map(d => d.label),
    datasets: [
      {
        label: 'Realizadas',
        data: days.map(d => d.realizadas),
        backgroundColor: '#10b981', // emerald
        borderRadius: { topLeft: 4, topRight: 4 },
        barThickness: 'flex',
        maxBarThickness: 40,
      },
      {
        label: 'Rechazadas',
        data: days.map(d => d.rechazadas),
        backgroundColor: '#f43f5e', // rose
        borderRadius: { topLeft: 4, topRight: 4 },
        barThickness: 'flex',
        maxBarThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          color: '#1e293b',
          font: { weight: 'bold', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.97)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          // Mostrar % de aceptación en el tooltip del día
          afterBody: (context) => {
            const idx = context[0]?.dataIndex;
            if (idx === undefined) return '';
            const row = days[idx];
            if (!row) return '';
            return `Aceptación: ${row.pctAceptacion}%`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        ticks: { color: '#1e293b', font: { size: 11, weight: 'bold' } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#1e293b', font: { weight: 'bold' }, precision: 0 },
        grid: { color: '#f1f5f9' },
      },
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 md:p-6 flex flex-col w-full h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
            Aceptación de encuestas
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            Encuestas realizadas vs rechazadas por día
          </p>
        </div>
        <DashboardFilter
          options={STATS_OPTIONS}
          selectedOption={filterOption}
          setSelectedOption={setFilterOption}
          selectedDay={customDate}
          setSelectedDay={setCustomDate}
        />
      </div>

      {/* Resumen del periodo — 3 pills */}
      {!loading && !error && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">
              {totals.realizadas} realizadas
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-xs font-bold text-rose-700">
              {totals.rechazadas} rechazadas
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
            <span className="text-xs font-bold text-indigo-700">
              {totals.pctAceptacion}% aceptación
            </span>
          </div>
        </div>
      )}

      {/* Gráfica */}
      <div className="flex-1 relative min-h-[280px]">
        {loading ? (
          <ChartLoading />
        ) : error ? (
          <div className="h-full flex items-center justify-center text-rose-400 text-sm font-semibold">
            {error}
          </div>
        ) : days.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
            Sin datos para este periodo
          </div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>

    </div>
  );
}