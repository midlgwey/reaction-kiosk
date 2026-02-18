import React from 'react';
import { useSuggestions } from '../../hooks/useSuggestions.js';
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function SuggestionCard({ ratingActual, onFinish, onCancel }) {
  
  const { text, setText, loading, handleSend } = useSuggestions(
    ratingActual,
    onFinish, 
    () => alert("Hubo un error al enviar, intente nuevamente.") 
  );

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 w-full max-w-2xl mx-auto border border-slate-100 relative animate-scale-in">
      
      {/* Botón Cerrar */}
      <button 
        onClick={onCancel}
        className="absolute top-6 right-6 p-3 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors active:scale-95"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>

      {/* Título */}
      <div className="mb-8">
        <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-3">
          Nos interesa tu opinión
        </h3>
        <p className="text-slate-500 text-lg md:text-xl font-medium">
          Ayúdanos a mejorar contándonos tu experiencia.
        </p>
      </div>
      
      {/* Formulario */}
      <textarea
        className="
          w-full 
          h-56 md:h-64      
          bg-slate-50        
          border-2 border-slate-200 
          rounded-2xl 
          p-6 
          text-xl md:text-2xl text-slate-700 
          placeholder:text-slate-400
          focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none 
          resize-none       
          transition-all
          shadow-inner
        "
        placeholder="Escriba su sugerencia, queja o felicitación aquí..."
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        disabled={loading}
        autoFocus 
      />

      <div className="flex gap-4 mt-8">
        
        {/* Botón Cancelar */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="
            flex-1 py-4 
            text-slate-500 font-bold text-xl 
            bg-white border-2 border-slate-200 rounded-2xl
            hover:bg-slate-50 hover:border-slate-300 hover:text-slate-600 
            transition-colors
          "
        >
          Cancelar
        </button>

        <button
          onClick={handleSend}
          disabled={loading || !text.trim()}
          className={`
            flex-1 py-4 rounded-2xl font-bold text-xl text-white shadow-xl transition-all flex items-center justify-center gap-3
            ${loading || !text.trim() 
              ? 'bg-indigo-300 cursor-not-allowed shadow-none' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-1 active:translate-y-0'}
          `}
        >
          {loading ? (

             <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Enviar</span>
              <PaperAirplaneIcon className="w-6 h-6" />
            </>
          )}
        </button>
       
      </div>
    </div>
  );
}