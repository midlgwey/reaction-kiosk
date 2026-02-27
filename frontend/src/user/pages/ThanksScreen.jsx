import React, { useState } from 'react';
import Lottie from "lottie-react";
import SuggestionButton from '../components/feedback/SuggestionButton';
import SuggestionCard from '../components/feedback/SuggestionCard';
import FeedbackSuccess from '../components/feedback/FeedbackSuccess'; 
import StaffResetButton from '../components/button/StaffResetButton';

import handsAnim from '../../assets/icons/hands.json';

export default function ThanksScreen({ onReset }) {
  
  // ESTADOS: 'THANKS' | 'FORM' | 'SUCCESS'
  const [view, setView] = useState('THANKS'); 
  
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center w-full h-full animate-fade-in relative">
      
      {/* Pantalla que lanza "gracias" */}
      {view === 'THANKS' && (
        <div className="text-center flex flex-col items-center max-w-2xl animate-slide-up">
          
          <h2 className="text-4xl md:text-6xl font-black text-indigo-600 mb-6 tracking-tight">
            ¡Gracias por su preferencia!
          </h2>

          <div className="w-48 h-48 md:w-56 md:h-56 mb-6">
             <Lottie animationData={handsAnim} loop={true} />
          </div>

          <p className="text-xl md:text-3xl text-slate-600 font-bold mb-10">
            Si pudieras mejorar una sola cosa para tu proxima visita, ¿qué sería?.
          </p>

          <SuggestionButton onClick={() => setView('FORM')} />

          {/* Botón de reinicio manual para personal (Staff) */}
          <StaffResetButton onReset={onReset} />

        </div>
      )}

      {/* Pantalla que lanza el card/form para escribir sugerencia */}
      {view === 'FORM' && (
        <div className="w-full max-w-2xl animate-scale-in">
          <SuggestionCard 
            onFinish={() => setView('SUCCESS')} // Al terminar, mostramos el éxito
            onCancel={() => setView('THANKS')} // Cancelar regresa a la pantalla estática
          />
        </div>
      )}

      {/* Al enviar sugerencia lanza envio exitoso y agradece */}
      {view === 'SUCCESS' && (
        <div className="flex flex-col items-center justify-center w-full h-full">
            
            {/* 1. Componente de Feedback Exitoso */}
            <FeedbackSuccess 
              // Se elimina la redirección automática.
              // La vista permanece estática esperando el reinicio manual.
              onFinished={() => {}} 
            />

            {/* 2. Botón de reinicio manual disponible en esta vista */}
            <StaffResetButton onReset={onReset} />
            
        </div>
      )}

    </div>
  );
}