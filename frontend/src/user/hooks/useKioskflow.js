import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiKiosk from '../../user/services/apiKiosk';
import { questions } from '../data/questions';
import { toastStyles } from '../../config/toastConfig';
import { getShiftByTime } from '../utils/timeCheck';

export const useKioskFlow = () => {
  const [empezado, setEmpezado] = useState(false);
  const [paso, setPaso] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  
  /**
   * Almacenamiento temporal de las respuestas seleccionadas.
   * Evita el registro de encuestas incompletas en la base de datos.
   */
  const [respuestas, setRespuestas] = useState([]);
  const timerRef = useRef(null);

  /**
   * Restablece el flujo a su estado inicial y limpia la memoria de respuestas.
   */
  const reiniciarKiosco = useCallback(() => {
    setPaso(0);
    setRespuestas([]);
    setTerminado(false);
    setEmpezado(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const iniciarKiosco = () => setEmpezado(true);

  /**
   * Control de tiempo de espera por inactividad (3 minutos).
   */
  const iniciarTemporizador = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      reiniciarKiosco();
    }, 180000);
  }, [reiniciarKiosco]);

  /**
   * Monitor de actividad global para refrescar el temporizador de sesión.
   */
  useEffect(() => {
    if (!empezado) return;

    const resetearInactividad = () => iniciarTemporizador();
    iniciarTemporizador();

    window.addEventListener('pointerdown', resetearInactividad);
    window.addEventListener('keydown', resetearInactividad);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('pointerdown', resetearInactividad);
      window.removeEventListener('keydown', resetearInactividad);
    };
  }, [empezado, iniciarTemporizador]);

  /**
   * Gestiona la selección de calificación. Acumula los datos localmente y,
   * al completar la última pregunta, realiza el envío masivo al servidor.
   */
  const handleRate = async (valor) => {
    if (enviando) return;

    const preguntaActual = questions[paso];
    const nuevasRespuestas = [...respuestas, { question_id: preguntaActual.id, value: valor }];

    // Si no es la última pregunta, se guarda en memoria y se avanza el paso.
    if (paso < questions.length - 1) {
      setRespuestas(nuevasRespuestas);
      setPaso((prev) => prev + 1);
      return;
    }

    // Validación de horario de servicio antes del procesamiento final.
    const turnoActual = getShiftByTime();
    if (turnoActual === "Fuera de horario") {
      toast.error("El sistema se encuentra fuera de horario de servicio.", {
        ...toastStyles,
        id: 'out-of-hours-limit',
        duration: 5000,
        icon: '⏰',
      });
      return;
    }

    setEnviando(true);
    try {
      /**
       * Se dispara el envío de todas las respuestas acumuladas de forma simultánea.
       * Esto asegura que solo se registren cuestionarios finalizados.
       */
      await Promise.all(
        nuevasRespuestas.map((res) =>
          apiKiosk.post("/reactions", {
            question_id: res.question_id,
            value: res.value,
          })
        )
      );

      setTerminado(true);
    } catch (error) {
      console.error("Error en el proceso de envío masivo:", error);
      toast.error('Error de conexión. Intente nuevamente.', {
        ...toastStyles,
        duration: 4000,
      });
    } finally {
      setEnviando(false);
    }
  };

  return {
    empezado,
    paso,
    terminado,
    enviando,
    preguntaActual: questions[paso],
    totalPreguntas: questions.length,
    iniciarKiosco,
    reiniciarKiosco,
    handleRate,
  };
};