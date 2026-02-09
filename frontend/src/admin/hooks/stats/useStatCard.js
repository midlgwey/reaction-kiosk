import { useEffect, useState } from "react";
import api from "../../services/api";

/* ===============================
   MEJOR PREGUNTA SEMANA
=================================*/
export function useBestQuestionWeek() {
  const [state, setState] = useState({
    question: "",
    avg: 0,
    votes: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/stats/best-question-week");

        if (!res.data?.bestQuestionWeek) {
          setState({
            question: "Sin datos aún",
            avg: 0,
            votes: 0,
            loading: false,
            error: null,
          });
          return;
        }

        setState({
          question: res.data.bestQuestionWeek.question,
          avg: res.data.bestQuestionWeek.avg_score,
          votes: res.data.bestQuestionWeek.total_votes,
          loading: false,
          error: null,
        });

      } catch {
        setState({
          question: "",
          avg: 0,
          votes: 0,
          loading: false,
          error: "Error cargando mejor pregunta",
        });
      }
    };

    fetchData();
  }, []);

  return state;
}


/* ===============================
   PEOR PREGUNTA SEMANA
=================================*/
export function useWorstQuestionWeek() {
  const [state, setState] = useState({
    question: "",
    avg: 0,
    votes: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/stats/worst-question-week");

        if (!res.data?.worstQuestionWeek) {
          setState({
            question: "Sin datos aún",
            avg: 0,
            votes: 0,
            loading: false,
            error: null,
          });
          return;
        }

        setState({
          question: res.data.worstQuestionWeek.question,
          avg: res.data.worstQuestionWeek.avg_score,
          votes: res.data.worstQuestionWeek.total_votes,
          loading: false,
          error: null,
        });

      } catch {
        setState({
          question: "",
          avg: 0,
          votes: 0,
          loading: false,
          error: "Error cargando peor pregunta",
        });
      }
    };

    fetchData();
  }, []);

  return state;
}

/* ===============================
   DIA MAS FUERTE
=================================*/
export function useStrongDayWeek() {
  const [state, setState] = useState({
    day: "",
    percent: 0,
    loading: true,
    error: null,
    ready: false, // controla si hay suficientes días
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("stats/weekly-day-strong");

        if (!res.data) {
          setState(prev => ({ ...prev, loading:false }));
          return;
        }

        // si menos de 3 dias → no mostrar
        if (res.data.total_days < 3) {
          setState({
            day: "",
            percent: 0,
            loading: false,
            error: null,
            ready: false
          });
          return;
        }

        setState({
          day: res.data.day_name,
          percent: res.data.satisfaction_percent,
          loading: false,
          error: null,
          ready: true
        });

      } catch {
        setState({
          day: "",
          percent: 0,
          loading: false,
          error: "Error cargando día fuerte",
          ready:false
        });
      }
    };

    fetchData();
  }, []);

  return state;
}


/* ===============================
  DIA MAS DEBIL
=================================*/
export function useWeakDayWeek() {
  const [state, setState] = useState({
    day: "",
    percent: 0,
    loading: true,
    error: null,
    ready:false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("stats/weekly-day-weak");

        if (!res.data) {
          setState(prev => ({ ...prev, loading:false }));
          return;
        }

        if (res.data.total_days < 3) {
          setState({
            day:"",
            percent:0,
            loading:false,
            error:null,
            ready:false
          });
          return;
        }

        setState({
          day: res.data.day_name,
          percent: res.data.satisfaction_percent,
          loading: false,
          error: null,
          ready:true
        });

      } catch {
        setState({
          day:"",
          percent:0,
          loading:false,
          error:"Error cargando día débil",
          ready:false
        });
      }
    };

    fetchData();
  }, []);

  return state;
}
