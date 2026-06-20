import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export const useWaiterPerformance = (month, year) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
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
  }, [month, year]);

  useEffect(() => {
    if (month && year) fetchData();
  }, [fetchData, month, year]);

  return { data, loading, error, refetch: fetchData }; 
};