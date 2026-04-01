
const getScoreStyles = (pts) => {
  if (pts >= 32) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (pts >= 16)   return "bg-blue-50 border-blue-200 text-blue-700";
  if (pts > 0) return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-rose-50 border-rose-200 text-rose-700";
};

export default function WaiterRow({ waiter, index }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-6 py-4 items-center hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100 last:border-0 lg:w-auto w-[500px] shrink-0">
      
      {/* Ranking / Medalla */}
      <div className="hidden lg:flex col-span-1 justify-center font-bold text-slate-800">
        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
      </div>

      {/* Avatar y Nombre */}
      <div className="col-span-1 lg:col-span-4 flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-100 text-indigo-900 font-bold flex items-center justify-center text-xs shrink-0 border border-orange-200">
          {waiter.mesero?.charAt(0) || '?'}
        </div>
        <p className="font-bold text-slate-700 text-sm truncate">{waiter.mesero}</p>
      </div>

      {/* Desempeño con colores dinámicos */}
      <div className="col-span-1 lg:col-span-2 flex flex-col items-start sm:items-center justify-center">
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getScoreStyles(waiter.puntuacion)}`}>
          {waiter.puntuacion} pts
        </span>
        <span className="text-[10px] text-slate-500 mt-1 font-medium">Promedio: {waiter.promedio}</span>
      </div>

      {/* Encuestas */}
      <div className="col-span-1 lg:col-span-2 flex justify-start lg:justify-center">
        <span className="bg-slate-100 border border-slate-200 text-cyan-600 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shrink-0">{waiter.interacciones}</span>
      </div>

      {/* Mesas */}
      <div className="col-span-1 lg:col-span-3 flex justify-start lg:justify-end flex-wrap gap-1">
        {waiter.detalle_mesas
          ? waiter.detalle_mesas.split(',').map((mesa, i) => (
              <span key={i} className="bg-slate-100 border border-slate-200 text-cyan-600 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shrink-0">
                {mesa.trim()}
              </span>
            ))
          : <span className="text-slate-400 text-[10px]">—</span>
        }
      </div>
    </div>
  );
}