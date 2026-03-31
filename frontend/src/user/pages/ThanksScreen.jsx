import React, { useState } from 'react';
import Lottie from "lottie-react";
import SuggestionButton from '../components/feedback/SuggestionButton';
import SuggestionCard from '../components/feedback/SuggestionCard';
import FeedbackSuccess from '../components/feedback/FeedbackSuccess';
import StaffResetButton from '../components/button/StaffResetButton';
import handsAnim from '../../assets/icons/hands.json';

export default function ThanksScreen({ onReset, onSubmitSuggestion, waiterId, tableNumber }) { 
  const [view, setView] = useState('THANKS');

  const handleSuggestionSubmit = async (comment) => {
    await onSubmitSuggestion(true, comment);
    setView('SUCCESS');
  };

  return (
    <div className="bg-gradient-to-br from-[#F4F6FB] to-[#c6b8d6] min-h-[100dvh] flex flex-col items-center justify-center w-full h-full animate-fade-in relative">

      {view === 'THANKS' && (
        <div className="text-center flex flex-col items-center max-w-2xl animate-slide-up">
          <h2 className="text-4xl md:text-6xl font-black text-indigo-600 mb-6 tracking-tight">
            ¡Gracias por su preferencia!
          </h2>
          <div className="w-48 h-48 md:w-56 md:h-56 mb-6">
            <Lottie animationData={handsAnim} loop={true} />
          </div>
          <p className="text-xl md:text-3xl text-slate-700 font-bold mb-10">
            Si pudieras mejorar una sola cosa para tu próxima visita, ¿qué sería?
          </p>
          <SuggestionButton onClick={() => setView('FORM')} />
          <StaffResetButton onReset={onReset} />
        </div>
      )}

      {view === 'FORM' && (
        <div className="w-full max-w-2xl animate-scale-in">
          <SuggestionCard
            waiterId={waiterId}         
            tableNumber={tableNumber}   
            onFinish={handleSuggestionSubmit} 
            onCancel={() => setView('THANKS')}
          />
        </div>
      )}

      {view === 'SUCCESS' && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <FeedbackSuccess onFinished={() => {}} />
          <StaffResetButton onReset={onReset} />
        </div>
      )}

    </div>
  );
}