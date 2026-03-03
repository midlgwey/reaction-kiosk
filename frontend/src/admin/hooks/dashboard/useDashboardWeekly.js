import { useEffect, useState } from "react";
import api from "../../services/api"; 

// Hook para la gráfica de área (Evolución diaria)
export function useDailySatisfactionTrend(config = { days: 7 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { days, startDate, endDate } = config;

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setLoading(true);
        let url = `/dashboard/daily-satisfaction`;
        
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        } else {
          url += `?days=${days || 7}`;
        }

        const res = await api.get(url);
        setData(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Error cargando evolución");
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [days, startDate, endDate]); 

  return { data, loading, error };
}

// Hook para la gráfica de dona (Distribución de sentimientos)
export function useWeeklySentiment(config = { days: 7 }) {
  const [data, setData] = useState({
    excelente: 0, bueno: 0, puede_mejorar: 0, malo: 0, total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { days, startDate, endDate } = config;

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true);
        let url = `/dashboard/weekly-sentiment`;
        
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        } else {
          url += `?days=${days || 7}`;
        }

        const res = await api.get(url);
        setData(res.data || {});
      } catch (err) {
        console.error(err);
        setError("Error cargando distribución");
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, [days, startDate, endDate]); 

  return { data, loading, error };
}