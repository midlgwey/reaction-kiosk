import React, { useState } from 'react';
import logodife from "../../assets/logo/logodife.png";

export default function ConsentPage({ onAccept, onDecline }) {
  const [processing, setProcessing] = useState(false);

  const handleDecline = async () => {
    if (processing) return; 
    setProcessing(true);
    await onDecline();
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#F4F6FB] to-[#c6b8d6] w-full flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center max-w-xl w-full">
        <div className="bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center gap-8 w-full border border-slate-100">
        
          <img 
            src={logodife} 
            alt="La Diferencia Logo" 
            className="w-48 sm:w-56 md:w-62 object-contain mb-2" 
          />
          
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-indigo-900 leading-tight mb-3">
              ¿Nos ayudas con una encuesta?
            </h2>
            <p className="text-slate-600 text-base md:text-lg font-medium">
              Nos encantaría saber cómo fue tu experiencia para seguir mejorando.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {/* Sí */}
            <button
              onClick={onAccept}
              disabled={processing}
              className="flex-1 py-5 bg-indigo-400 hover:bg-indigo-600 text-white font-extrabold text-xl rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>😊</span>
              <span>Sí, con gusto</span>
            </button>

            {/* No */}
            <button
              onClick={handleDecline}
              disabled={processing}
              className={`flex-1 py-5 bg-white text-slate-500 font-bold text-xl rounded-2xl border-2 border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${processing ? 'cursor-not-allowed' : 'hover:bg-slate-50'}`}
            >
              {processing ? (
                <div className="w-6 h-6 border-4 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
              ) : (
                <>
                  <span>Quizá en otra ocasión</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}