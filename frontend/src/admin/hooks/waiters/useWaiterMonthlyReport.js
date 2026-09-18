// hooks/waiters/useWaiterMonthlyReport.js
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export const useWaiterMonthlyReport = (month, year) => {
  const [dailyStats, setDailyStats] = useState([]);
  const [performanceReport, setPerformanceReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!month || !year) return;

    setLoading(true);
    setError(null);

    try {
      const [dailyRes, performanceRes] = await Promise.all([
        api.get('/waiter-stats/get-daily-waiter-stats', {
          params: { month, year }
        }),
        api.get('/waiter-stats/get-performance-report', {
          params: { month, year }
        })
      ]);

      setDailyStats(dailyRes.data);
      setPerformanceReport(performanceRes.data);
    } catch (err) {
      console.error('Error fetching monthly report:', err);
      setError(err.response?.data?.message || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    dailyStats,
    performanceReport,
    loading,
    error,
    refetch: fetchData
  };
};