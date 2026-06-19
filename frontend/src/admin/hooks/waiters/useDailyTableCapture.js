import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';

export const useDailyTableCapture = (month, year) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/real-tables/by-month', {
        params: { month, year }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Error en useDailyTableCapture:", err);
      setError("No se pudo cargar el historial");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    if (month && year) fetchHistory();
  }, [fetchHistory, month, year]);

  const captureToday = async (waiterId, tableCount) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      await api.post('/real-tables/capture', {
        waiter_id: waiterId,
        date: today,
        table_count: tableCount
      });
      await fetchHistory();
    } catch (err) {
      console.error("Error al capturar mesas:", err);
      throw err;
    }
  };

  const updateEntry = async (id, tableCount) => {
    try {
      await api.put(`/real-tables/${id}`, { table_count: tableCount });
      await fetchHistory();
    } catch (err) {
      console.error("Error al actualizar registro:", err);
      throw err;
    }
  };

  const deleteEntry = async (id) => {
    try {
      await api.delete(`/real-tables/${id}`);
      await fetchHistory();
    } catch (err) {
      console.error("Error al eliminar registro:", err);
      throw err;
    }
  };

  return { history, loading, error, captureToday, updateEntry, deleteEntry };
};