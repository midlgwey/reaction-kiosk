import { useEffect, useState } from "react";
import api from "../../services/api";

/* ===============================
   TOTAL REACCIONES DEL DÍA
=================================*/
export function useDailyReactions() {
  const [state, setState] = useState({
    totalReactions: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard/daily-reactions");

        setState({
          totalReactions: res.data.totalReactionsToday ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        setState({
          totalReactions: 0,
          loading: false,
          error: "Error cargando reacciones",
        });
      }
    };

    fetchData();
  }, []);

  return state;
}

/* ===============================
   SERVICIO DEL MESERO
=================================*/
export function useDailyServerScore() {
  const [state, setState] = useState({
    avgScore: 0,
    totalResponses: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard/daily-serverscore");

        setState({
          avgScore: res.data.avgScore ?? 0,
          totalResponses: res.data.totalResponses ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        setState({
          avgScore: 0,
          totalResponses: 0,
          loading: false,
          error: "Error cargando servicio",
        });
      }
    };

    fetchData();
  }, []);

  return state;
}

/* ===============================
   INDICE FELICIDAD
=================================*/
export function useDailyHappinessIndex() {
  const [state, setState] = useState({
    happinessPercent: 0,
    avgScore: 0,
    totalResponses: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard/happiness-index");

        setState({
          happinessPercent: res.data.happinessPercent ?? 0,
          avgScore: res.data.avgScore ?? 0,
          totalResponses: res.data.totalResponses ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        setState({
          happinessPercent: 0,
          avgScore: 0,
          totalResponses: 0,
          loading: false,
          error: "Error cargando felicidad",
        });
      }
    };

    fetchData();
  }, []);

  return state;
}

/* ===============================
   ENCUESTAS REALIZADAS POR DIA
=================================*/

export const useDailySurveyCount = () => {
  const [data, setData] = useState({ realizadas: 0, rechazadas: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      setLoading(true);
      try {
        const response = await api.get('/dashboard/daily-survey-count');
        setData(response.data);
      } catch (err) {
        console.error("Error en useDailySurveyCount:", err);
        setError("No se pudo cargar el conteo de encuestas");
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  return { data, loading, error };
};