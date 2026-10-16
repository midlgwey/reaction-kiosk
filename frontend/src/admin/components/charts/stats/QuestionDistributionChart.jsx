import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { useQuestionDistribution } from '../../../hooks/stats/useStatChart';

// ─── Paleta de colores ────────────────────────────────────────────────────────
const COLORS = {
  excelente:    { bg: 'bg-emerald-500', hex: '#10b981', light: 'bg-emerald-100', text: 'text-emerald-700' },
  bueno:        { bg: 'bg-indigo-400',  hex: '#818cf8', light: 'bg-indigo-100',  text: 'text-indigo-700'  },
  puede_mejorar:{ bg: 'bg-amber-400',   hex: '#fbbf24', light: 'bg-amber-100',   text: 'text-amber-700'   },
  malo:         { bg: 'bg-rose-500',    hex: '#f43f5e', light: 'bg-rose-100',    text: 'text-rose-700'    },
};

const LABELS = {
  excelente:    'Excelente',
  bueno:        'Bueno',
  puede_mejorar:'Puede mejorar',
  malo:         'Malo',
};

// Selector de semanas — mismo helper que usaba el radar
const getRecentTuesdays = () => {
  const options = [];
  const today = new Date();
  let lastTuesday = new Date(today);
  const dayOfWeek = lastTuesday.getDay();

  if (dayOfWeek !== 2) {
    const daysToSubtract = dayOfWeek >= 2 ? dayOfWeek - 2 : dayOfWeek + 5;
    lastTuesday.setDate(lastTuesday.getDate() - daysToSubtract);
  }

  for (let i = 0; i < 4; i++) {
    const start = new Date(lastTuesday);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const label = `${start.getDate()} ${start.toLocaleString('es-MX', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('es-MX', { month: 'short' })}`;
    const formatDB = (date) => date.toISOString().split('T')[0];

    options.push({
      value: `week_${i}`,
      label: i === 0 ? `Esta semana (${label})` : label,
      startDate: formatDB(start),
      endDate: formatDB(end),
    });
  }
  return options;
};

// ─── Tooltip al hover sobre un segmento ──────────────────────────────────────
function SegmentTooltip({ visible, label, count, pct, color }) {
  if (!visible) return null;
  return (
    <div className={`
      absolute -top-10 left-1/2 -translate-x-1/2
      px-2 py-1 rounded-lg text-[10px] font-bold text-white whitespace-nowrap
      shadow-lg z-20 pointer-events-none
    `} style={{ backgroundColor: color }}>
      {label}: {count} ({pct}%)
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
        style={{ borderTopColor: color }} />
    </div>
  );
}

// ─── Barra horizontal 100% apilada para una pregunta ─────────────────────────
function QuestionBar({ question, data, index }) {
  const [hovered, setHovered] = useState(null);

  // Etiqueta corta de la pregunta para móvil
  const shortQuestion = question.length > 45
    ? question.substring(0, 42) + '...'
    : question;

  const segments = [
    { key: 'excelente',     pct: data.pctExcelente,     count: data.excelente     },
    { key: 'bueno',         pct: data.pctBueno,         count: data.bueno         },
    { key: 'puede_mejorar', pct: data.pctPuedeMejorar,  count: data.puede_mejorar },
    { key: 'malo',          pct: data.pctMalo,           count: data.malo          },
  ].filter(s => s.pct > 0);

  return (
    <div className="mb-5 last:mb-0">
      {/* Pregunta + total */}
      <div className="flex justify-between items-baseline mb-1.5 gap-2">
        <p className="text-xs font-bold text-slate-700 leading-snug flex-1" title={question}>
          <span className="text-indigo-400 mr-1.5">P{index + 1}.</span>
          {shortQuestion}
        </p>
        <span className="text-[10px] text-slate-400 font-semibold shrink-0">
          {data.total} resp.
        </span>
      </div>

      {/* Barra */}
      {data.total === 0 ? (
        <div className="h-7 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="text-[10px] text-slate-400 italic">Sin respuestas</span>
        </div>
      ) : (
        <div className="relative flex h-7 rounded-full overflow-hidden gap-px bg-white">
          {segments.map((seg) => (
            <div
              key={seg.key}
              className={`relative h-full ${COLORS[seg.key].bg} flex items-center justify-center
                cursor-pointer transition-opacity duration-150
                ${hovered && hovered !== seg.key ? 'opacity-50' : 'opacity-100'}
              `}
              style={{ width: `${seg.pct}%` }}
              onMouseEnter={() => setHovered(seg.key)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Porcentaje inline si cabe */}
              {seg.pct >= 12 && (
                <span className="text-white text-[10px] font-black select-none">
                  {seg.pct}%
                </span>
              )}

              {/* Tooltip */}
              <SegmentTooltip
                visible={hovered === seg.key}
                label={LABELS[seg.key]}
                count={seg.count}
                pct={seg.pct}
                color={COLORS[seg.key].hex}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
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

export default function QuestionDistributionChart() {
  const selectOptions = useMemo(() => {
    const weeks = getRecentTuesdays();
    return [
      { value: '7days', label: 'Últimos 7 días', startDate: null, endDate: null },
      ...weeks,
    ];
  }, []);

  const [selectedOption, setSelectedOption] = useState(selectOptions[0]);

  const config = selectedOption.value === '7days'
    ? { days: 7 }
    : { startDate: selectedOption.startDate, endDate: selectedOption.endDate };

  const { questions, loading, error } = useQuestionDistribution(config);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 md:p-6 flex flex-col w-full h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
            Distribución por pregunta
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            % de respuestas por calificación
          </p>
        </div>

        <div className="w-full sm:w-56">
          <Select
            options={selectOptions}
            value={selectedOption}
            onChange={(opt) => setSelectedOption(opt)}
            styles={customSelectStyles}
            isSearchable={false}
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 min-h-[250px]">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-indigo-400 text-xs font-semibold">Cargando datos...</span>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-rose-400 text-sm font-semibold min-h-[250px]">
            {error}
          </div>
        ) : questions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm italic min-h-[250px]">
            Sin datos para este periodo
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full">
            {/* Barras */}
            <div className="flex-1">
              {questions.map((q, i) => (
                <QuestionBar
                  key={i}
                  index={i}
                  question={q.question}
                  data={q}
                />
              ))}
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-5 pt-4 border-t border-slate-100">
              {Object.entries(COLORS).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${val.bg}`} />
                  <span className="text-[11px] font-semibold text-slate-500">
                    {LABELS[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}