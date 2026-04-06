export default function LogbookRow({ decline }) {
  const isRealizada = decline.estado === 'Realizada';

  return (
    <div className="grid grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-6 py-4 items-center hover:bg-rose-50/30 rounded-xl transition-colors border-b border-slate-100 last:border-0 lg:w-auto w-[600px] shrink-0">
      
      <div className="col-span-2 text-center">
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200">
          {decline.hora}
        </span>
      </div>

      <div className="col-span-3 flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs border shrink-0
          ${isRealizada ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
          {decline.mesero?.charAt(0) || '?'}
        </div>
        <p className="font-bold text-slate-700 text-xs lg:text-sm truncate">{decline.mesero}</p>
      </div>

      <div className="col-span-2 text-center">
        <span className="bg-cyan-50 border border-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-[11px] font-black">
          MESA {decline.mesa}
        </span>
      </div>

      {/* ✅ Turno */}
      <div className="col-span-2 text-center">
        <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
          {decline.turno}
        </span>
      </div>

      <div className="col-span-3 text-right">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter
          ${isRealizada 
            ? 'bg-emerald-100 border border-emerald-200 text-emerald-600' 
            : 'bg-rose-100 border border-rose-200 text-rose-600'}`}>
          {decline.estado}
        </span>
      </div>
    </div>
  );
}