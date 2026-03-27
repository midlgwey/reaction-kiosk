import React from 'react';
import { BackspaceIcon, ArrowRightIcon, TrashIcon } from '@heroicons/react/24/solid';

const Numpad = ({ onNumberClick, onDeleteClick, onClear, onSend, cargando }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="w-full max-w-[300px]">
      <div className="grid grid-cols-3 gap-3 mb-4">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className="h-14 w-full flex items-center justify-center bg-indigo-400 text-white text-xl font-extrabold rounded-xl active:scale-95 transition-all shadow-sm"
          >
            {num}
          </button>
        ))}

        {/* Botón C - Limpiar todo */}
        <button 
          onClick={onClear} 
          className="h-14 w-full flex items-center justify-center text-gray-500 hover:text-black transition-colors"
          title="Limpiar todo"
        >
          <TrashIcon className="w-7 h-7" />
        </button>

        {/* Número 0 */}
        <button
          onClick={() => onNumberClick(0)}
          className="h-14 w-full flex items-center justify-center bg-indigo-400 text-white text-xl font-extrabold rounded-xl active:scale-95 transition-all shadow-sm"
        >
          0
        </button>

        {/* Botón Borrar - Retroceso */}
        <button 
          onClick={onDeleteClick} 
          className="h-14 w-full flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
        >
          <BackspaceIcon className="w-8 h-8" />
        </button>
      </div>

        {/* Botón Enviar */}
      <button 
        onClick={onSend}
        disabled={cargando}
        className={`
          w-full h-12 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all uppercase tracking-wider
          ${cargando 
            ? 'bg-teal-500/70 cursor-wait shadow-none' // Estilo mientras carga
            : 'bg-teal-600 shadow-lg shadow-teal-100 active:scale-[0.98]' // Estilo normal
          }
        `}
      >
        {cargando ? (
          // Spinner de carga de Tailwind
          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            Enviar 
            <ArrowRightIcon className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
};

export default Numpad;