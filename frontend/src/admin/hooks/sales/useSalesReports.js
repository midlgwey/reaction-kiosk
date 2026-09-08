// frontend/src/admin/hooks/sales/useSalesReport.js
import { useState, useCallback } from 'react';
import api from '../../services/api';

export const useSalesReport = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetchDashboard = useCallback(async (month) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/sales/dashboard', { params: { month } });
      setDashboard(data);
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        setDashboard(null);
      } else {
        setError('Error al cargar datos de ventas');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { dashboard, loading, error, fetchDashboard };
};