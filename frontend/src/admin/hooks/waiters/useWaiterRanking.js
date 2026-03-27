import { useState, useEffect } from 'react';
import api from "../../services/api"; 

export const useWaiterRanking = (selectedDate, activeShift) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const shiftParam = activeShift === 'matutino' ? 'Desayuno' : 'Comida/Cena';
        const dateParam = selectedDate === 'hoy' ? new Date().toISOString().split('T')[0] : selectedDate;

        // USA 'api.get' en lugar de 'axios.get'
        // El path debe coincidir con como lo registres en index.js
        const response = await api.get('/waiter-stats/get-waitersranking', {
          params: { date: dateParam, shift: shiftParam }
        });

        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error en useWaiterRanking:", err);
        setError("No se pudo obtener el ranking.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, activeShift]);

  return { data, loading, error }; 
};