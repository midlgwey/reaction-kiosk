import React, { useState } from 'react';

const variants = {
  indigo: { bg: "bg-indigo-100", border: "border-indigo-200", textTitle: "text-indigo-800", iconContainer: "bg-white/60 text-indigo-600" },
  emerald: { bg: "bg-emerald-100", border: "border-emerald-200", textTitle: "text-emerald-800", iconContainer: "bg-white/60 text-emerald-600" },
  amber: { bg: "bg-amber-100", border: "border-amber-200", textTitle: "text-amber-800", iconContainer: "bg-white/60 text-amber-600" },
  blue: { bg: "bg-blue-100", border: "border-blue-200", textTitle: "text-blue-800", iconContainer: "bg-white/60 text-blue-600" },
  purple: { bg: "bg-purple-100", border: "border-purple-200", textTitle: "text-purple-800", iconContainer: "bg-white/60 text-purple-600" },
  rose: { bg: "bg-rose-100", border: "border-rose-200", textTitle: "text-rose-800", iconContainer: "bg-white/60 text-rose-600" },
  orange: { bg: "bg-orange-100", border: "border-orange-200", textTitle: "text-orange-800", iconContainer: "bg-white/60 text-orange-600" }
};

export default function StatCard({ title, value, subtitle, icon, color = 'indigo', tooltip }) {
  // Seleccionamos el tema de color o usamos 'indigo' por defecto
  const theme = variants[color] || variants.indigo;
  
  // Estado para controlar la visibilidad del modal en móviles
  const [isOpen, setIsOpen] = useState(false);

  // Al hacer clic o touch, si hay tooltip abrimos el modal personalizado
  const handleClick = () => {
    if (tooltip) {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Tarjeta principal */}
      <div 
        onClick={handleClick}
        className={`
          ${theme.bg} ${theme.border} 
          p-4 lg:p-5             
          rounded-2xl border flex flex-col justify-between 
          shadow-sm transition-all hover:shadow-md 
          min-h-32.5 cursor-pointer select-none
        `}
      >
        {/* Cabecera con título e icono */}
        <div className="flex justify-between items-start gap-2">
          <p className={`${theme.textTitle} text-[10px] lg:text-xs font-extrabold uppercase tracking-wider mt-1`}>
            {title}
          </p>
          
          {icon && (
            <div className={`${theme.iconContainer} p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0`}>
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
            <p className="text-slate-800 text-[10px] lg:text-xs font-bold mt-1 leading-snug">
              {subtitle}
            </p>
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