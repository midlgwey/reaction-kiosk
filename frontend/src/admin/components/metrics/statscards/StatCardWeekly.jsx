import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/solid';

/**
 * Colores de acento — SOLO se usan en el ícono y en el borde izquierdo.
 * El fondo de la card siempre es blanco, sin importar el color asignado.
 */
const accentColors = {
  emerald: {
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    borderAccent: "border-l-emerald-400",
    titleText: "text-emerald-700",
  },
  rose: {
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    borderAccent: "border-l-rose-400",
    titleText: "text-rose-700",
  },
  indigo: {
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-600",
    borderAccent: "border-l-indigo-400",
    titleText: "text-indigo-700",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    borderAccent: "border-l-amber-400",
    titleText: "text-amber-700",
  },
};

/**
 * Badge de tendencia.
 * Regla simple: subir = verde, bajar = rojo, sin cambios = gris.
 * El significado (si subir es bueno o malo) ya viene resuelto desde el backend.
 */
function TrendBadge({ direction, diffLabel }) {
  if (!direction || direction === 'flat') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
        <MinusIcon className="w-3 h-3" />
        {diffLabel || 'Sin cambios'}
      </span>
    );
  }

  const colorClass = direction === 'up' ? 'text-emerald-600' : 'text-rose-600';
  const Icon = direction === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${colorClass}`}>
      <Icon className="w-3 h-3" />
      {diffLabel}
    </span>
  );
}

export default function StatCardWeekly({ title, question, subtitle, icon, color = 'indigo', trend }) {

  const accent = accentColors[color] || accentColors.indigo;

  return (
    <div className={`
      bg-white border border-slate-200 border-l-4 ${accent.borderAccent}
      p-4 lg:p-5           
      rounded-2xl flex flex-col justify-between 
      shadow-sm transition-all hover:shadow-md 
      min-h-[130px]         
    `}>
      
      {/* HEADER: Título e Icono */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <p className={`${accent.titleText} text-[10px] lg:text-xs font-extrabold uppercase tracking-wider mt-1 leading-tight`}>
          {title}
        </p>
        
        {icon && (
          <div className={`${accent.iconBg} ${accent.iconText} p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0`}>
             {React.cloneElement(icon, { className: "w-5 h-5 lg:w-6 lg:h-6" })}
          </div>
        )}
      </div>

      {/* Pregunta / Valor Principal */}
      <div className="mt-auto">
        <h3 className="text-sm md:text-base lg:text-lg font-black text-slate-800 leading-tight line-clamp-2 min-h-[3rem]"
          title={typeof question === 'string' ? question : undefined}>
          {question}
        </h3>
      
        {/* Subtítulo (Porcentaje) */}
        {subtitle && (
          <p className="text-slate-500 text-[10px] lg:text-xs font-bold mt-2">
            {subtitle}
          </p>
        )}

        {/* Trend */}
        {trend && (
          <div className="mt-1.5">
            <TrendBadge direction={trend.direction} diffLabel={trend.diffLabel} />
          </div>
        )}
      </div>
    </div>
  );
}