import React from 'react';

const variants = {

  emerald: { // Para "Pregunta Mejor Valorada"
    bg: "bg-emerald-100",
    border: "border-emerald-200",
    textTitle: "text-emerald-800",
    iconContainer: "bg-white/60 text-emerald-600",
    subtitle: "text-emerald-700"
  },
  rose: { // Para "Pregunta con más Quejas"
    bg: "bg-rose-100",
    border: "border-rose-200",
    textTitle: "text-rose-800",
    iconContainer: "bg-white/60 text-rose-600",
    subtitle: "text-rose-700"
  },
  indigo: { // Default
    bg: "bg-indigo-100",
    border: "border-indigo-200",
    textTitle: "text-indigo-800",
    iconContainer: "bg-white/60 text-indigo-600",
    subtitle: "text-indigo-700"
  }
};

export default function StatCardWeekly({ title, question, subtitle, icon, color = 'indigo' }) {

  const theme = variants[color] || variants.indigo;

  return (
    <div className={`
      ${theme.bg} ${theme.border} 
      p-4 lg:p-5           
      rounded-2xl border flex flex-col justify-between 
      shadow-sm transition-all hover:shadow-md 
      min-h-[130px]         
    `}>
      
      {/* HEADER: Título e Icono */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <p className={`${theme.textTitle} text-[10px] lg:text-xs font-extrabold uppercase tracking-wider mt-1 leading-tight`}>
          {title}
        </p>
        
        {icon && (
          <div className={`${theme.iconContainer} p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0`}>
             {/* Forzamos tamaño de icono consistente */}
             {React.cloneElement(icon, { className: "w-5 h-5 lg:w-6 lg:h-6" })}
          </div>
        )}
      </div>

      {/* BODY: Pregunta Principal */}
      <div className="mt-auto">
        {/* Usamos break-words para que si la pregunta es larga, baje de línea y no rompa el grid */}
        <h3 className="text-sm md:text-base lg:text-lg font-black text-slate-900 leading-tight break-words">
          {question}
        </h3>
        
        {/* Subtítulo (Porcentaje) */}
        {subtitle && (
          <p className={`${theme.subtitle} text-[10px] lg:text-xs font-bold mt-2`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}