import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  const navigate = useNavigate();

  return (
   <div className="h-full w-full flex flex-col items-center justify-center text-center animate-fade-in py-12">
      
      {/* Icono de Alerta Suave */}
      <div className="bg-white p-6 rounded-full shadow-xl mb-8">
        <ExclamationTriangleIcon className="w-20 h-20 text-indigo-500" />
      </div>

      <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-4 tracking-tight">
        404
      </h1>
      
      <h2 className="text-2xl md:text-3xl font-bold text-slate-600 mb-6">
        Página no encontrada
      </h2>

      <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
        Parece que te has desviado del camino. No te preocupes, puedes volver al inicio con un solo clic.
      </p>

      {/* Botón de Acción */}
      <button
        onClick={() => navigate('/')} // Esto te lleva a la raíz (Login o Home)
        className="
          flex items-center gap-3 
          bg-indigo-600 text-white 
          px-8 py-4 rounded-2xl 
          text-lg font-bold 
          shadow-lg shadow-indigo-200
          hover:bg-indigo-700 hover:-translate-y-1 
          transition-all active:scale-95
        "
      >
        <HomeIcon className="w-6 h-6" />
        <span>Volver al Inicio</span>
      </button>

    </div>
  );
}