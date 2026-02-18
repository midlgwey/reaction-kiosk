import { useEffect, useState } from "react";
import api from "../../services/api";

/* =========================================================
   HELPER: Hook Genérico para no repetir código
   (Esto hace tu código más limpio y profesional)
   ========================================================= */
function useGenericCardData(endpoint, days) {
  const [state, setState] = useState({
    data: null, // Guardamos toda la data aquí
    loading: true,
    error: null,
    ready: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        // AQUÍ ESTÁ LA MAGIA: Pasamos ?days=...
        const res = await api.get(`${endpoint}?days=${days}`);

        // Verificamos si la respuesta viene vacía o nula
        // Ajusta la validación según la estructura de cada endpoint
        const values = Object.values(res.data)[0]; // Truco para agarrar la primera llave del JSON (ej: bestQuestionWeek)
        
        if (!res.data || !values) {
           setState({ data: null, loading: false, error: null, ready: false });
           return;
        }

        setState({
          data: values, // Guardamos el objeto (question, avg_score, etc.)
          loading: false,
          error: null,
          ready: true
        });

      } catch (err) {
        setState(prev => ({ ...prev, loading: false, error: "Error de red", ready: false }));
      }
    };
    fetchData();
  }, [days, endpoint]); // Se re-ejecuta si cambian los días

  return state;
}

/* ===============================
   HOOKS EXPORTABLES (Ahora flexibles)
=================================*/

export function useBestQuestionWeek(days = 7) {
  const { data, loading, error, ready } = useGenericCardData("/stats/best-question-week", days);
  return {
    question: data?.question || "",
    avg: data?.avg_score || 0,
    votes: data?.total_votes || 0,
    loading, error, ready
  };
}

export function useWorstQuestionWeek(days = 7) {
  const { data, loading, error, ready } = useGenericCardData("/stats/worst-question-week", days);
  return {
    question: data?.question || "",
    avg: data?.avg_score || 0,
    votes: data?.total_votes || 0,
    loading, error, ready
  };
}

export function useStrongDayWeek(days = 7) {
  // Nota: tus endpoints de días devuelven el objeto directo, no anidado.
  // Podrías necesitar un pequeño ajuste si el backend devuelve { day_name: ... } directo.
  // Asumiremos que el backend devuelve JSON directo.
  const [state, setState] = useState({ day: "", percent: 0, loading: true, ready: false });

  useEffect(() => {
      api.get(`/stats/weekly-day-strong?days=${days}`)
         .then(res => {
             if(!res.data) {
                 setState({ day: "", percent: 0, loading: false, ready: false });
             } else {
                 setState({ 
                     day: res.data.day_name, 
                     percent: res.data.satisfaction_percent, 
                     loading: false, 
                     ready: true 
                 });
             }
         })
         .catch(() => setState(p => ({...p, loading: false, ready: false})));
  }, [days]);
  
  return state;
}

export function useWeakDayWeek(days = 7) {
  const [state, setState] = useState({ day: "", percent: 0, loading: true, ready: false });

  useEffect(() => {
      api.get(`/stats/weekly-day-weak?days=${days}`)
         .then(res => {
             if(!res.data) {
                 setState({ day: "", percent: 0, loading: false, ready: false });
             } else {
                 setState({ 
                     day: res.data.day_name, 
                     percent: res.data.satisfaction_percent, 
                     loading: false, 
                     ready: true 
                 });
             }
         })
         .catch(() => setState(p => ({...p, loading: false, ready: false})));
  }, [days]);
  
  return state;
}