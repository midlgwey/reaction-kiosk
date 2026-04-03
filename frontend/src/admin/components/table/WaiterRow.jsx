
// WaiterRow.jsx
const getScoreStyles = (pts) => {
  if (pts >= 32) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (pts >= 16)   return "bg-blue-50 border-blue-200 text-blue-700";
  if (pts > 0) return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-rose-50 border-rose-200 text-rose-700";
};
 
export default function WaiterRow({ waiter, index }) {
  return (
    <div className="grid grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-6 py-4 items-center hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100 last:border-0 lg:w-auto w-[600px] shrink-0">
      
      {/* Ranking / Medalla */}
      <div className="col-span-1 text-center font-bold text-slate-800 text-sm lg:text-base">
        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
      </div>
 
      {/* Avatar y Nombre */}
      <div className="col-span-4 flex items-center gap-2 lg:gap-3 min-w-0">
        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-orange-100 text-indigo-900 font-bold flex items-center justify-center text-xs shrink-0 border border-orange-200">
          {waiter.mesero?.charAt(0) || '?'}
        </div>
        <p className="font-bold text-slate-700 text-xs lg:text-sm truncate">{waiter.mesero}</p>
      </div>
 
      {/* Desempeño */}
      <div className="col-span-2 text-center">
        <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded-full text-[10px] lg:text-[11px] font-bold border ${getScoreStyles(waiter.puntuacion)}`}>
          {waiter.puntuacion} pts
        </span>
        <p className="text-[9px] lg:text-[10px] text-slate-500 mt-0.5 lg:mt-1 font-medium">Promedio: {waiter.promedio}</p>
      </div>
 
      {/* Encuestas */}
      <div className="col-span-2 text-center">
        <span className="bg-slate-100 border border-slate-200 text-cyan-600 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">{waiter.interacciones}</span>
      </div>

      {/* Rechazos */}
      <div className="col-span-1 lg:col-span-2 flex justify-start lg:justify-center">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border
          ${waiter.rechazos > 0 
            ? 'bg-rose-100 border-rose-200 text-rose-600' 
            : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
          {waiter.rechazos}
        </span>
      </div>
 
      {/* Mesas */}
      <div className="col-span-3 flex justify-end flex-wrap gap-1">
        {waiter.detalle_mesas
          ? waiter.detalle_mesas.split(',').map((mesa, i) => (
              <span key={i} className="bg-slate-100 border border-slate-200 text-cyan-600 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                {mesa.trim()}
              </span>
            ))
          : <span className="text-slate-400 text-[10px]">—</span>
        }
      </div>
    </div>
  );
}
 