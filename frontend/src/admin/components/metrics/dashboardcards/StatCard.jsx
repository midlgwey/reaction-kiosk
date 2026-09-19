import React, { useState } from 'react';

/**
 * Colores de acento — SOLO se usan en el ícono y en el borde izquierdo.
 * El fondo de la card siempre es blanco, sin importar el color asignado.
 */
const accentColors = {
  indigo: {
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-600",
    borderAccent: "border-l-indigo-400",
    titleText: "text-indigo-700",
  },
  emerald: {
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    borderAccent: "border-l-emerald-400",
    titleText: "text-emerald-700",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    borderAccent: "border-l-amber-400",
    titleText: "text-amber-700",
  },
  blue: {
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    borderAccent: "border-l-blue-400",
    titleText: "text-blue-700",
  },
  purple: {
    iconBg: "bg-purple-100",
    iconText: "text-purple-600",
    borderAccent: "border-l-purple-400",
    titleText: "text-purple-700",
  },
  rose: {
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    borderAccent: "border-l-rose-400",
    titleText: "text-rose-700",
  },
  orange: {
    iconBg: "bg-orange-100",
    iconText: "text-orange-600",
    borderAccent: "border-l-orange-400",
    titleText: "text-orange-700",
  },
};

export default function StatCard({ title, value, subtitle, icon, color = 'indigo', tooltip, trend, trendTooltip }) {
  const accent = accentColors[color] || accentColors.indigo;
  
  const [isOpen, setIsOpen] = useState(false);
  const [showTrendTooltip, setShowTrendTooltip] = useState(false);

  const handleClick = () => {
    if (tooltip) {
      setIsOpen(true);
    }
  };

  // Toggle trend tooltip en mobile (tap), hover en desktop
  const toggleTrendTooltip = () => {
    setShowTrendTooltip(!showTrendTooltip);
  };

  return (
    <>
      {/* Tarjeta principal */}
      <div 
        onClick={handleClick}
        className={`
          bg-white border border-slate-200 border-l-4 ${accent.borderAccent}
          p-4 lg:p-5             
          rounded-2xl flex flex-col justify-between 
          shadow-sm transition-all hover:shadow-md 
          min-h-32.5 cursor-pointer select-none
        `}
      >
        {/* Cabecera con título e icono */}
        <div className="flex justify-between items-start gap-2">
          <p className={`${accent.titleText} text-[10px] lg:text-xs font-extrabold uppercase tracking-wider mt-1`}>
            {title}
          </p>
          
          {icon && (
            <div className={`${accent.iconBg} ${accent.iconText} p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0`}>
              {React.cloneElement(icon, { className: "w-5 h-5 lg:w-6 lg:h-6" })}
            </div>
          )}
        </div>

        {/* Sección de valor principal y subtítulo */}
        <div className="mt-3">
          <h3 
            className="text-lg md:text-xl lg:text-2xl font-black text-slate-800 leading-tight line-clamp-1 md:line-clamp-2 min-h-[1.75rem] md:min-h-[3rem]" 
            title={tooltip || (typeof value === 'string' ? value : '')}
          >
            {value}
          </h3>

          {subtitle && (
            <p className="text-slate-500 text-[10px] lg:text-xs font-bold mt-1 leading-snug">
              {subtitle}
            </p>
          )}

          {/* Trend Indicator — Con tooltip interactivo (hover en desktop, tap en mobile) */}
          {trend && (
            <div 
              className={`flex items-center gap-0.5 font-bold text-xs md:text-sm ${trend.color} mt-2 relative group cursor-help`}
              onMouseEnter={() => setShowTrendTooltip(true)}
              onMouseLeave={() => setShowTrendTooltip(false)}
              onClick={(e) => {
                e.stopPropagation(); // No propagar el click de la card
                toggleTrendTooltip();
              }}
            >
              <span>{trend.icon}</span>
              <span>{trend.label}</span>
              
              {/* Tooltip del Trend — Aparece en hover (desktop) o tap (mobile) */}
              {trendTooltip && showTrendTooltip && (
                <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded whitespace-nowrap z-10 pointer-events-none">
                  {trendTooltip}
                  <div className="absolute top-full left-2 border-4 border-transparent border-t-slate-900"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal flotante personalizado para mostrar el detalle completo */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl border border-slate-100">
            
            {/* Título y botón de cerrar */}
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                {title}
              </h4>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            {/* Contenido detallado del tooltip */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-xs font-medium text-slate-700 whitespace-pre-line leading-relaxed">
              {tooltip}
            </div>

            {/* Botón de acción para cerrar */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}