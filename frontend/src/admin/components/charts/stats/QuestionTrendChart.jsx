import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useQuestionTrend } from '../../../hooks/stats/useStatChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ─── Colores por pregunta ─────────────────────────────────────────────────────
const QUESTION_COLORS = [
  { hex: '#6366f1', light: 'rgba(99,102,241,0.08)'  }, // Indigo  — P1 Mesero
  { hex: '#10b981', light: 'rgba(16,185,129,0.08)'  }, // Emerald — P2 Bebidas
  { hex: '#f59e0b', light: 'rgba(245,158,11,0.08)'  }, // Amber   — P3 Alimentos
  { hex: '#f43f5e', light: 'rgba(244,63,94,0.08)'   }, // Rose    — P4 Instalaciones
];

const STATS_OPTIONS = [
  { value: '7',   label: 'Últimos 7 días'    },
  { value: '14',  label: 'Últimas 2 semanas'  },
  { value: '30',  label: 'Último mes'         },
  { value: '90',  label: 'Últimos 3 meses'    },
  { value: '180', label: 'Últimos 6 meses'    },
  { value: '365', label: 'Último año'         },
];

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

const ChartLoading = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3" />
    <span className="text-indigo-400 text-sm font-semibold">Cargando datos...</span>
  </div>
);

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// ─── Helper: convierte el period del backend a etiqueta legible ───────────────
// labelType: 'day' → '15 Oct', 'week' → '13-19 Oct', 'month' → 'Oct 2026'
function formatPeriodLabel(period, labelType) {
  if (labelType === 'day') {
    // period: '2026-10-15'
    const d = new Date(`${period}T12:00:00`);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  }
  if (labelType === 'week') {
    // period: '2026-42' (año-semanaISO SQLite con %W = semana del año, lunes=inicio)
    // Reconstruimos la fecha de inicio de esa semana
    const [year, week] = period.split('-');
    const weekNum = parseInt(week);
    // Primer día del año
    const jan1 = new Date(`${year}-01-01T12:00:00`);
    // Avanzamos weekNum semanas desde el primer lunes del año
    const firstMonday = new Date(jan1);
    const dow = jan1.getDay(); // 0=Dom, 1=Lun...
    const daysToMonday = dow === 0 ? 1 : (8 - dow) % 7 || 7;
    firstMonday.setDate(jan1.getDate() + daysToMonday - 7);
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + weekNum * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startLabel = `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()]}`;
    const endLabel   = `${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]}`;
    // Si inicio y fin son del mismo mes, simplificamos
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${weekStart.getDate()}-${weekEnd.getDate()} ${MONTH_NAMES[weekStart.getMonth()]}`;
    }
    return `${startLabel} - ${endLabel}`;
  }
  if (labelType === 'month') {
    // period: '2026-10'
    const [year, month] = period.split('-');
    return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
  }
  return period;
}

export default function QuestionTrendChart() {
  const [selectedOption, setSelectedOption] = useState(STATS_OPTIONS[0]);

  const config = useMemo(() => ({
    days: Number(selectedOption.value),
  }), [selectedOption]);

  const { labels, questions, labelType, loading, error } = useQuestionTrend(config);

  // Convertir labels del backend a etiquetas legibles
  const displayLabels = labels.map(p => formatPeriodLabel(p, labelType));

  const chartData = {
    labels: displayLabels,
    datasets: questions.map((q, i) => ({
      label: q.label,
      data: q.data,             // null donde no hay datos → no dibuja el punto
      spanGaps: true,           // Une los puntos saltando los null (días cerrados)
      borderColor: QUESTION_COLORS[i]?.hex || '#94a3b8',
      backgroundColor: QUESTION_COLORS[i]?.light || 'rgba(148,163,184,0.08)',
      borderWidth: 2.5,
      pointRadius: labels.length > 30 ? 2 : 4,
      pointHoverRadius: 6,
      pointBackgroundColor: QUESTION_COLORS[i]?.hex || '#94a3b8',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      tension: 0.35,
      fill: false,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyleWidth: 8,
          boxHeight: 6,
          color: '#1e293b',
          font: { weight: 'bold', size: 11 },
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.97)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y;
            if (val === null || val === 0) return ` ${ctx.dataset.label}: Sin datos`;
            return ` ${ctx.dataset.label}: ${val.toFixed(2)} / 4`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#64748b',
          font: { size: 11, weight: 'bold' },
          maxRotation: labels.length > 20 ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
        grid: { display: false },
      },
      y: {
        min: 3,
        max: 4,
        ticks: {
          color: '#64748b',
          font: { weight: 'bold', size: 11 },
          stepSize: 0.25,
          callback: (val) => val.toFixed(2),
        },
        grid: { color: '#f1f5f9' },
      },
    },
  };

  // Pills: mejor y peor del último periodo con datos
  const lastDayStats = questions.length > 0
    ? questions
        .map(q => {
          const lastVal = [...q.data].reverse().find(v => v !== null && v > 0);
          return { label: q.label, val: lastVal || 0 };
        })
        .filter(q => q.val > 0)
        .sort((a, b) => b.val - a.val)
    : [];

  const best  = lastDayStats[0] || null;
  const worst = lastDayStats[lastDayStats.length - 1] || null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 md:p-6 flex flex-col w-full h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
            Evolución por pregunta
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            Calificación promedio por {labelType === 'day' ? 'día' : labelType === 'week' ? 'semana' : 'mes'}{' '}
            en escala del 1 al 4
            {' · '}
            <span className="text-indigo-400 font-semibold">Solo días con servicio</span>
          </p>
        </div>

        <div className="w-full sm:w-52">
          <Select
            options={STATS_OPTIONS}
            value={selectedOption}
            onChange={(opt) => setSelectedOption(opt)}
            styles={customSelectStyles}
            isSearchable={false}
          />
        </div>
      </div>

      {/* Pills: mejor y peor */}
      {!loading && !error && best && worst && best.label !== worst.label && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <span className="text-[10px] font-black text-emerald-600">↑ MEJOR</span>
            <span className="text-xs font-bold text-emerald-700">{best.label}</span>
            <span className="text-[10px] text-emerald-500 font-semibold">{best.val.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full">
            <span className="text-[10px] font-black text-rose-600">↓ PEOR</span>
            <span className="text-xs font-bold text-rose-700">{worst.label}</span>
            <span className="text-[10px] text-rose-500 font-semibold">{worst.val.toFixed(2)}</span>
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
        ) : labels.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
            Sin datos para este periodo
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>

    </div>
  );
}