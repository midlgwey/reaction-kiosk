import { useState, useEffect } from 'react';
import api from '../../user/services/api'; 

export const useActiveWaiters = () => {
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWaiters = async () => {
      try {
        const res = await api.get('/waiter/get-active-waiters');
        setWaiters(res.data);
      } catch (err) {
        console.error("Error al cargar meseros:", err);
        setError("No se pudo cargar la lista de meseros");
      } finally {
        setLoading(false);
      }
    };
    fetchWaiters();
  }, []);

  return { waiters, loading, error };
};