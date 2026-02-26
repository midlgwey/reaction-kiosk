import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import api from '../../admin/services/api';
import ReactionGrid from '../components/emojipanel/ReactionGrid';
import ThanksScreen from './ThanksScreen';
import { questions } from '../data/questions';
import { toastStyles } from '../../config/toastConfig';
import { getShiftByTime } from '../utils/timeCheck'; 

export default function QuestionScreen() {
  const [paso, setPaso] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const preguntaActual = questions[paso];

  /**
   * Restablece el estado inicial del cuestionario.
   */
  const reiniciarKiosco = () => {
    setPaso(0);
    setTerminado(false);
  };

  /**
   * Gestión de temporizador para reinicio automático por inactividad.
   */
  useEffect(() => {
    if (terminado) return;

    const timer = setTimeout(() => {
      reiniciarKiosco(); 
    }, 60000);

    return () => clearTimeout(timer);
  }, [paso, terminado]);

  /**
   * Procesa la calificación del usuario.
   * Valida horario de operación antes de iniciar la petición asíncrona.
   */
  const handleRate = async (valor) => {
    if (enviando) return;

    // Validación de disponibilidad del servicio basada en la hora de Tijuana
    const turnoActual = getShiftByTime();

    if (turnoActual === "Fuera de horario") {
      return toast.error("El sistema se encuentra fuera de horario de servicio.", {
        ...toastStyles, // Aplicación de estilos globales (bordes, sombras, padding)
        id: 'out-of-hours-limit', 
        duration: 5000,
        icon: '⏰',
        iconTheme: toastStyles.error.iconTheme, // Mantiene el color rojo definido para errores
      });
    }

    setEnviando(true);

    try {
      // Registro de respuesta en persistencia
      await api.post("/reactions", {
        question_id: preguntaActual.id,
        value: valor,
      });

      // Gestión de navegación entre pasos del cuestionario
      if (paso < questions.length - 1) {
        setPaso(prev => prev + 1);
      } else {
        setTerminado(true);
      }

    } catch (error) {
      console.error("Error en flujo de votación:", error);
      
      // Notificación de fallo de red con estilos unificados
      toast.error('Error de conexión. Intente nuevamente.', {
        ...toastStyles,
        duration: 4000,
        position: 'top-center',
      });

    } finally {
      setEnviando(false);
    }
  };

  // Renderizado condicional para finalización de flujo
  if (terminado) {
    return <ThanksScreen onReset={reiniciarKiosco} />;
  }

  return (
    <div className="bg-slate-200  w-full flex flex-col items-center justify-center animate-fade-in">

      {/* Indicador visual de progreso */}
      <div className="w-full max-w-2xl mb-10">
        <div className="bg-gray-300 h-2 rounded-full">
          <div 
            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${((paso + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Despliegue de interrogante actual */}
      <h1 className="
        text-2xl md:text-4xl xl:text-5xl
        font-black text-gray-800 
        text-center 
        mb-14
        leading-tight
        max-w-4xl
      ">
        {preguntaActual.title}
      </h1>

      {/* Componente de entrada de datos (Reacciones) */}
      <ReactionGrid key={paso} onSelect={handleRate} />

    </div>
  );
}