import React from 'react';
import logodife from "../../assets/logo/logodife.png";

export default function ConsentPage({ onAccept, onDecline }) {
  return (

    <div className="min-h-[100dvh] bg-gradient-to-br from-[#F4F6FB] to-[#c6b8d6] flex flex-col items-center justify-center p-6 select-none">
      
      <div className="flex flex-col items-center max-w-xl w-full">
        
        <img 
          src={logodife} 
          alt="La Diferencia Logo" 
          className="w-52 sm:w-64 md:w-72 object-contain mb-10" 
        />

        <div className="bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center gap-8 w-full border border-slate-100">
          
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-indigo-900 leading-tight mb-3">
              ¿Nos ayudas con una encuesta?
            </h2>
            <p className="text-slate-500 text-base md:text-lg font-medium">
              Nos encantaría saber cómo fue tu experiencia para seguir mejorando.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            
            {/* Sí */}
            <button
              onClick={onAccept}
              className="flex-1 py-5 bg-indigo-500 hover:bg-indigo-700 text-white font-extrabold text-xl rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>😊</span>
              <span>Sí, con gusto</span>
            </button>

            {/* No */}
            <button
              onClick={onDecline}
              className="flex-1 py-5 bg-white hover:bg-slate-50 text-slate-500 font-bold text-xl rounded-2xl border-2 border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>🙏</span>
              <span>Quizá en otra ocasión</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}