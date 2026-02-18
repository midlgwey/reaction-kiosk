import React from 'react';

const variants = {
  indigo: { // Tu color original (Default)
    bg: "bg-indigo-100",
    border: "border-indigo-200",
    textTitle: "text-indigo-800",
    iconContainer: "bg-white/60 text-indigo-600" 
  },
  emerald: { // Para cosas positivas / Reacciones
    bg: "bg-emerald-100",
    border: "border-emerald-200",
    textTitle: "text-emerald-800",
    iconContainer: "bg-white/60 text-emerald-600"
  },
  amber: { // Para Estrellas / Servicio
    bg: "bg-amber-100",
    border: "border-amber-200",
    textTitle: "text-amber-800",
    iconContainer: "bg-white/60 text-amber-600"
  },
  blue: { // Para Felicidad
    bg: "bg-blue-100",
    border: "border-blue-200",
    textTitle: "text-blue-800",
    iconContainer: "bg-white/60 text-blue-600"
  },
  purple: { // Para Turnos
    bg: "bg-purple-100",
    border: "border-purple-200",
    textTitle: "text-purple-800",
    iconContainer: "bg-white/60 text-purple-600"
  },
  rose: { // Para ALERTAS 
    bg: "bg-rose-100",
    border: "border-rose-200",
    textTitle: "text-rose-800",
    iconContainer: "bg-white/60 text-rose-600"
  },
  orange: { // Para Focos Rojos / Advertencias
    bg: "bg-orange-100",
    border: "border-orange-200",
    textTitle: "text-orange-800",
    iconContainer: "bg-white/60 text-orange-600"
  }
};

export default function StatCard({ title, value, subtitle, icon, color = 'indigo' }) {
  
  // Seleccionamos el tema. Si el color no existe, usamos 'indigo'
  const theme = variants[color] || variants.indigo;

  return (
    <div className={`
      ${theme.bg} ${theme.border} 
      p-4 lg:p-5              
      rounded-2xl border flex flex-col justify-between 
      shadow-sm transition-all hover:shadow-md 
      min-h-32.5          
    `}>
      
      {/* HEADER: Título e Icono */}
      <div className="flex justify-between items-start gap-2">
        <p className={`${theme.textTitle} text-[10px] lg:text-xs font-extrabold uppercase tracking-wider mt-1`}>
          {title}
        </p>
        
        {icon && (
          // Icono más compacto (w-10 en vez de w-14)
          <div className={`${theme.iconContainer} p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0`}>
            {/* Forzamos al SVG a ser pequeño también */}
            {React.cloneElement(icon, { className: "w-5 h-5 lg:w-6 lg:h-6" })}
          </div>
        )}
      </div>

      {/* BODY: Valor y Subtítulo */}
      <div className="mt-3">
        <h3 className="text-xl lg:text-2xl font-black text-slate-800 leading-none">
          {value}
        </h3>

        {subtitle && (
          // Texto pequeño y SIN truncate para que baje de línea si no cabe
          <p className="text-slate-800 text-[10px] lg:text-xs font-bold mt-1 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}