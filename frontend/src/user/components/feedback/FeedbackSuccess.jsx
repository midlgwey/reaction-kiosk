import React, { useEffect } from 'react';
import { CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export default function FeedbackSuccess({ onFinished }) {
  
  // Controla el tiempo del componente
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished(); // Avisa a componente padre que ya acabo el tiempo
    }, 3500); // 3.5 segundos de tiempo

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl border border-emerald-100 text-center max-w-lg w-full animate-bounce-in mx-4">
      
      {/* Círculo Icono */}
      <div className="flex justify-center mb-8">
        <div className="bg-emerald-50 p-6 rounded-full animate-pulse-slow">
          <CheckCircleIcon className="w-24 h-24 text-emerald-500 drop-shadow-sm" />
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">
        ¡Mensaje Enviado!
      </h2>
      
      <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
        Gracias por ayudarnos a mejorar.<br/>
        El equipo ya recibió tu comentario.
      </p>

      {/* Indicador de regreso */}
      <div className="flex items-center justify-center space-x-3 text-indigo-500 font-bold bg-indigo-50 py-3 px-6 rounded-full w-fit mx-auto">
        <span className="text-xs md:text-sm uppercase tracking-widest">Favor de dejar la tablet en la mesa</span>
      </div>
    </div>
  );
}