import React from 'react';
import ReactionGrid from '../components/emojipanel/ReactionGrid';
import ThanksScreen from '../pages/ThanksScreen';
import WelcomeScreen from '../pages/WelcomeScreen';
import { useKioskflow } from '../../user/hooks/useKioskflow';

export default function QuestionScreen() {
  
  const {
    empezado,
    paso,
    terminado,
    preguntaActual,
    totalPreguntas,
    iniciarKiosco,
    reiniciarKiosco,
    handleRate
  } = useKioskflow();

  if (!empezado) {
    return <WelcomeScreen onStart={iniciarKiosco} />;
  }

  if (terminado) {
    return <ThanksScreen onReset={reiniciarKiosco} />;
  }

  return (
    <div className="min-h-[100dvh] bg-slate-200 w-full flex flex-col items-center justify-center animate-fade-in">

      {/* Indicador de progreso de la encuesta */}
      <div className="w-full max-w-2xl mb-10 px-4">
        <div className="bg-white h-2 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-500 h-full transition-all duration-500"
            style={{ width: `${((paso + 1) / totalPreguntas) * 100}%` }}
          />
        </div>
      </div>

      {/* Encabezado de la pregunta actual */}
      <h1 className="text-2xl md:text-4xl xl:text-5xl font-black text-gray-800 text-center mb-14 leading-tight max-w-4xl px-4">
        {preguntaActual?.title}
      </h1>

      {/* Panel de selección de reacción */}
      <ReactionGrid key={paso} onSelect={handleRate} />

    </div>
  );
}