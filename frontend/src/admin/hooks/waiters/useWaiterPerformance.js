import { useState, useEffect } from 'react';
import api from '../../services/api';

export const useWaiterPerformance = (month, year) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
       setLoading(true);
       setError(null);
      try {
        const res = await api.get('/waiter-stats/get-performance-report', {
          params: { month, year }
        });
        setData(res.data);
      } catch (err) {
        console.error("Error en useWaiterPerformance:", err);
        setError("No se pudo cargar el reporte");
        setData([]);
        } finally {
        setLoading(false);
      }
    };

    if (month && year) fetchData();
  }, [month, year]);

  return { data, loading, error };
};