import React from 'react';
import ReactionGrid from '../components/emojipanel/ReactionGrid';
import { questions } from '../../user/data/questions';

export default function QuestionScreen({ onAnswer, currentStep }) {
  const preguntaActual = questions[currentStep];
  const totalPreguntas = questions.length;

  return (
    <div className="min-h-[100dvh] bg-slate-200 w-full flex flex-col items-center justify-center animate-fade-in">

      {/* Barra de progreso */}
      <div className="w-full max-w-2xl mb-10 px-4">
        <div className="bg-white h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / totalPreguntas) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="text-2xl md:text-4xl xl:text-5xl font-black text-gray-800 text-center mb-14 leading-tight max-w-4xl px-4">
        {preguntaActual?.title}
      </h1>

      <ReactionGrid 
        key={currentStep} 
        onSelect={(value) => onAnswer(preguntaActual.id, value)} 
      />

    </div>
  );
}