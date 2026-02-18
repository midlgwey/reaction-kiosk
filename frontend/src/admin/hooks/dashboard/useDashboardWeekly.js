import { useEffect, useState } from "react";
import api from "../../services/api"; 

//hook para la grafica de area
export function useDailySatisfactionTrend(days = 7) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/dashboard/daily-satisfaction?days=${days}`);

        setData(res.data || []);

      } catch (err) {
        console.error(err);
        setError("Error cargando evolución");
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [days]); //Si cambian los días, se vuelve a ejecutar

  return { data, loading, error };
}

//hook para la grafica de dona
export function useWeeklySentiment(days = 7) {

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
        setLoading(true);

        const res = await api.get(`/dashboard/weekly-sentiment?days=${days}`);

        setData(res.data || {});

      } catch (err) {
        console.error(err);
        setError("Error cargando distribución");
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, [days]); // Si cambian los días, se vuelve a ejecutar

  return { data, loading, error };
}

