// src/admin/hooks/stats/useStatCard.js
import { useEffect, useState } from "react";
import api from "../../services/api";

/* =========================================================
  Hook Genérico para no repetir código en las cards de estadísticas
   ======================================================== */
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
       
        const res = await api.get(`${endpoint}?days=${days}`);

        // Verificamos si la respuesta viene vacía o nula
        const values = Object.values(res.data)[0]; // Truco para agarrar la primera llave del JSON (ej: bestQuestionWeek)
        
        if (!res.data || !values) {
           setState({ data: null, loading: false, error: null, ready: false });
           return;
        }

        setState({
          data: values, // Guardamos el objeto (question, avg_score, trend, etc.)
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
   HOOKS EXPORTABLES — PREGUNTAS
=================================*/

export function useBestQuestionWeek(days = 7) {
  const { data, loading, error, ready } = useGenericCardData("/stats/best-question-week", days);
  return {
    question: data?.question || "",
    avg: data?.avg_score || 0,
    votes: data?.total_votes || 0,
    trend: data?.trend || null,
    loading, error, ready
  };
}

export function useWorstQuestionWeek(days = 7) {
  const { data, loading, error, ready } = useGenericCardData("/stats/worst-question-week", days);
  return {
    question: data?.question || "",
    avg: data?.avg_score || 0,
    votes: data?.total_votes || 0,
    trend: data?.trend || null,
    loading, error, ready
  };
}

/* ===============================
   HOOKS EXPORTABLES — DÍAS
=================================*/

export function useStrongDayWeek(days = 7) {
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

/* ===============================
   HOOKS EXPORTABLES — RECHAZOS Y TOTAL DE ENCUESTAS
=================================*/

export function useWeeklyDeclinesTrend(days = 7) {
  const [state, setState] = useState({ total: 0, trend: null, loading: true, error: null });

  useEffect(() => {
    api.get(`/stats/weekly-declines-trend?days=${days}`)
      .then(res => {
        setState({
          total: res.data?.total ?? 0,
          trend: res.data?.trend || null,
          loading: false,
          error: null
        });
      })
      .catch(() => setState({ total: 0, trend: null, loading: false, error: "Error de red" }));
  }, [days]);

  return state;
}

export function useWeeklyTotalSurveys(days = 7) {
  const [state, setState] = useState({ total: 0, trend: null, loading: true, error: null });

  useEffect(() => {
    api.get(`/stats/weekly-total-surveys?days=${days}`)
      .then(res => {
        setState({
          total: res.data?.total ?? 0,
          trend: res.data?.trend || null,
          loading: false,
          error: null
        });
      })
      .catch(() => setState({ total: 0, trend: null, loading: false, error: "Error de red" }));
  }, [days]);

  return state;
}