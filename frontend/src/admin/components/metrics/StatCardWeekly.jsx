export default function StatCardWeekly({ title, question, subtitle, icon }) {
  return (
    <div className="bg-indigo-100 sm:p-4 p-6 lg:p-8 rounded-4xl border border-slate-300 flex flex-col justify-between shadow-sm">
      
      {/* Título e icono */}
      <div className="flex justify-between items-start">

        <p className="text-indigo-800 text-xs md:text-xs lg:text-sm font-bold">{title}</p>
        {icon && <div className="p-2 sm:p-3 rounded-lg flex items-center justify-center">{icon}</div>}
      </div>

      {/* Pregunta / Valor principal */}
      <div className="mt-1">

        <h3 className="text-xs md:text-base lg:text-lg font-bold text-slate-900">"{question}"</h3>
        
        {/* Subtítulo opcional */}
        {subtitle && (
          <p className="text-slate-900 text-sm md:text-xl lg:text-2xl font-extrabold mt-2">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
