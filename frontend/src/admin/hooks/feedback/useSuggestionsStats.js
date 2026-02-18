import { useState, useEffect, useCallback } from 'react';
import api from '../../../admin/services/api'

export function useFeedbackStats() {
  const [stats, setStats] = useState({
    total: 0,
    criticalShift: "Cargando...",
    mainComplaint: "Analizando...",
    strongPoint: "Buscando..."
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      
      const response = await api.get('/suggestions/feedback-stats');
      
      setStats(response.data);
    } catch (error) {
      console.error("Error en useFeedbackStats:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}