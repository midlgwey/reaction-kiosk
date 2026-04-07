import React, { useState } from 'react';
import { useActiveWaiters } from '../../user/hooks/useActiveWaiters';

export default function AssignWaiterPage({ onAssign, onSkip }) {
  const [selected, setSelected] = useState(null);
  const { waiters, loading, error } = useActiveWaiters(); 

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6FB] to-[#a5c1db] w-full flex flex-col items-center justify-center p-4">
      <div className="bg-indigo-50 p-10 rounded-[2rem] shadow-xl flex flex-col items-center w-full max-w-sm border border-gray-100">

        <header className="text-center mb-8">
          <span className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-1 block">
            Modo Supervisor
          </span>
          <h1 className="text-2xl font-extrabold text-gray-800">
            ¿A quién asignar la encuesta?
          </h1>
          <p className="text-sm mt-2 text-gray-600">
            Selecciona un mesero o continúa con tu propio PIN
          </p>
        </header>

        <div className="w-full flex flex-col gap-3 mb-6 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center font-bold">{error}</p>
          ) : (
            waiters.map(w => (
              <button
                key={w.id}
                onClick={() => setSelected(w.id)}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-sm border-2 transition-all
                  ${selected === w.id
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}
              >
                {w.name}
              </button>
            ))
          )}
        </div>

        <button
          onClick={() => selected && onAssign(selected)}
          disabled={!selected}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all mb-3"
        >
          Confirmar mesero
        </button>

        <button
          onClick={onSkip}
          className="w-full py-4 bg-teal-500 text-white font-bold text-lg rounded-2xl border-2 border-teal-700 hover:bg-teal-700 transition-all"
        >
          Continuar con mi PIN
        </button>

      </div>
    </div>
  );
}