import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useRecentAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/alerts/recent-alerts'); 
      setAlerts(res.data);
    } catch (err) {
      console.error("Error cargando alertas", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, loading, refresh: fetchAlerts };
}