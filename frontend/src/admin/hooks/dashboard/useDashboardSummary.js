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
   FELICIDAD POR TURNO
=================================*/
export function useDailyHappinessByShift() {
  const [state, setState] = useState({
    breakfast: 0,
    lunchDinner: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard/happiness-shift");

        setState({
          breakfast: res.data.desayuno ?? 0,     // backend manda "desayuno"
          lunchDinner: res.data.comidaCena ?? 0, // backend manda "comidaCena"
          loading: false,
          error: null,
        });
      } catch {
        setState({
          breakfast: 0,
          lunchDinner: 0,
          loading: false,
          error: "Error cargando turnos",
        });
      }
    };

    fetchData();
  }, []);

  return state;
}
