import { useState, useEffect } from 'react';
import api from '../../services/api';

export const useActiveWaitersAdmin = () => {
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWaiters = async () => {
      try {
        const res = await api.get('/waiter/get-active-waiters');
        setWaiters(res.data);
      } catch (err) {
        console.error("Error al cargar meseros:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWaiters();
  }, []);

  return { waiters, loading };
};