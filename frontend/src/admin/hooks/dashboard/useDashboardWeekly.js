import { useEffect, useState } from "react";
import api from "../../services/api"; 

export function useDailySatisfactionTrend() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const res = await api.get("/dashboard/daily-satisfaction");
        setData(res.data || []);
      } catch (err) {
        setError("Error cargando evolución semanal");
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, []);

  return { data, loading, error };
}
export function useWeeklySentiment() {
  const [data, setData] = useState({
    excelente: 0,
    bueno: 0,
    puede_mejorar: 0,
    malo: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const res = await api.get("/dashboard/weekly-sentiment");
        setData(res.data || {});
      } catch (err) {
        setError("Error cargando distribución semanal");
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, []);

  return { data, loading, error };
}

