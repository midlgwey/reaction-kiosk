import { useState, useEffect } from 'react';
import api from '../../services/api'; // Ajusta esta ruta hacia donde tengas tu archivo api.js

export const useWaiterDeclines = (date, shift) => {

  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeclines = async () => {
      setLoading(true);
      setError(null);

      try {

        const shiftParam = shift === 'matutino' ? 'Desayuno' : 'Comida/Cena'; 

          const response = await api.get('/waiter-stats/get-waiterdeclines', {
          params: { date, shift: shiftParam }
        });

        // Con Axios, la respuesta ya viene parseada dentro de .data
        setData(response.data);
        
      } catch (err) {
        console.error("Error en useWaiterDeclines:", err);
        // Nota: Si el error es 401, tu interceptor ya se encargará de redirigir al login
        setError("Hubo un problema al cargar el historial de rechazos.");
        setData([]); 
      } finally {
        setLoading(false);
      }
    };

    if (date && shift) {
      fetchDeclines();
    }
  }, [date, shift]); 

  return { data, loading, error };
};
