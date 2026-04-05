import { useState, useEffect } from 'react';
import api from '../../services/api';

export const useWaiterLogbook = (date, activeTab) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLog = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = activeTab === 'realizadas'
          ? '/waiter-stats/get-surveyslog'
          : '/waiter-stats/get-declineslog';

        const response = await api.get(endpoint, {
          params: { date }
        });

        setData(response.data);
      } catch (err) {
        console.error("Error en useLogbook:", err);
        setError("No se pudo cargar la bitácora.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (date) fetchLog();
  }, [date, activeTab]);

  return { data, loading, error };
};