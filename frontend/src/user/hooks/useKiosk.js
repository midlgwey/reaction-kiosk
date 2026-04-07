import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../../user/services/api'; 

export const useKiosk = (totalQuestions = 4) => {
  const [step, setStep] = useState('HOME');
  const [waiterId, setWaiterId] = useState(null);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [tableNumber, setTableNumber] = useState(null);
  const [responses, setResponses] = useState([]);

  const timerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  const startKiosk = () => setStep('PIN');

  const resetKiosk = useCallback(() => {
    setStep('HOME');
    setWaiterId(null);
    setIsSupervisor(false);
    setTableNumber(null);
    setResponses([]);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
     if (step === 'TABLE' || step === 'CONSENT' || step === 'SURVEY' || step === 'SUGGESTION') {
      inactivityTimerRef.current = setTimeout(() => {
        resetKiosk();
      }, 45000);
    }
  }, [step, resetKiosk]);

  useEffect(() => {
    const handleActivity = () => resetInactivityTimer();
    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    resetInactivityTimer();
    return () => {
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetInactivityTimer]);

   const unlockKiosk = (id, is_supervisor) => {
    setWaiterId(id);
    setIsSupervisor(is_supervisor === 1);
    setResponses([]);
    setStep(is_supervisor === 1 ? 'ASSIGN' : 'TABLE');
  };

  const assignWaiter = (selectedWaiterId) => {
    setWaiterId(selectedWaiterId);
    setStep('TABLE');
  };

  const skipAssign = () => {
    setStep('TABLE');
  };

  const assignTable = (number) => {
    setTableNumber(number);
    setStep('CONSENT');
  };

  const handleConsent = async (accepted) => {
  if (accepted) {
    setStep('SURVEY');
  } else {
  
    try {
      await api.post('/declines/register-decline', {
        waiter_id: waiterId,
        table_number: tableNumber
      });
    } catch (error) {
      console.error("Error al registrar rechazo:", error);
    }
    setStep('THANKS');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => resetKiosk(), 10000);
  }
};

  const handleAnswer = async (questionId, value) => {
    const newResponses = [...responses, { question_id: questionId, value }];
    setResponses(newResponses);

    if (newResponses.length === totalQuestions) {
      setStep('SUGGESTION');
      try {
        await api.post('/reactions', {
          waiter_id: waiterId,
          table_number: tableNumber,
          responses: newResponses
        });
      } catch (error) {
        console.error("Error al guardar respuestas:", error);
      }
    }
  };

  const handleSuggestionChoice = () => {
    setStep('THANKS');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => resetKiosk(), 10000);
  };

  return {
    step,
    waiterId,
    isSupervisor,
    tableNumber,
    responses,
    startKiosk,
    unlockKiosk,
    assignWaiter,  
    skipAssign, 
    assignTable,
    handleAnswer,
    handleConsent,
    handleSuggestionChoice,
    resetKiosk
  };
};