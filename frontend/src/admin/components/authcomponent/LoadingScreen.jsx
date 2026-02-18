import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-slate-50 animate-fade-in">
      
      {/* Spinner con tus colores Indigo y Slate */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
      
      <p className="mt-6 text-slate-500 font-bold tracking-[0.2em] uppercase text-[10px] animate-pulse">
        Validando Acceso
      </p>
    </div>
  );
}