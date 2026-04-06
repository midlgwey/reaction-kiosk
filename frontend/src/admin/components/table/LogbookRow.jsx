export default function LogbookRow({ decline }) {
  const isRealizada = decline.estado === 'Realizada';

  return (
    <div className="border-b border-slate-100 last:border-0">
      {/* Fila principal */}
      <div className="grid grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-6 py-4 items-center hover:bg-rose-50/30 rounded-xl transition-colors lg:w-auto w-[600px] shrink-0">
        
        <div className="col-span-2 text-center">
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-black border border-slate-200">
            {decline.hora}
          </span>
        </div>

        <div className="col-span-3 flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0
            ${isRealizada ? 'bg-orange-100 text-indigo-900' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
            {decline.mesero?.charAt(0) || '?'}
          </div>
          <p className="font-bold text-slate-700 text-xs lg:text-sm truncate">{decline.mesero}</p>
        </div>

        <div className="col-span-2 text-center">
          <span className="bg-cyan-50 border border-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-[11px] font-black">
            MESA {decline.mesa}
          </span>
        </div>

        <div className="col-span-2 text-center">
          <span className="bg-cyan-50 border border-cyan-100 text-cyan-700 px-2 py-1 rounded text-[10px] font-black uppercase">
            {decline.turno}
          </span>
        </div>

        <div className="col-span-3 text-right">
          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter
            ${isRealizada 
              ? 'bg-slate-100 border border-slate-200 text-emerald-600' 
              : 'bg-rose-100 border border-rose-200 text-rose-600'}`}>
            {decline.estado}
          </span>
        </div>
      </div>

      {isRealizada && decline.respuestas?.length > 0 && (
        <div className="grid grid-cols-4 gap-2 px-6 pb-4 lg:w-auto w-[600px]">
          {decline.respuestas.map((r, i) => (
            <div key={i} className={`flex flex-col items-center py-2 px-3 rounded-xl border
              ${r.score?.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' :
                r.score?.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                r.score?.color === 'amber' ? 'bg-amber-50 border-amber-200' :
                r.score?.color === 'rose' ? 'bg-rose-50 border-rose-200' :
                'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[11px] font-black
                ${r.score?.color === 'emerald' ? 'text-emerald-600' :
                  r.score?.color === 'blue' ? 'text-blue-600' :
                  r.score?.color === 'amber' ? 'text-amber-600' :
                  r.score?.color === 'rose' ? 'text-rose-600' : 'text-slate-400'}`}>
                {r.score?.label || '—'}
              </span>
            </div>
          ))}
        </div>

      )}
    </div>
  );
}