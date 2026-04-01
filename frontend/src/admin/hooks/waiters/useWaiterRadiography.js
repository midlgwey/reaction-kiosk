import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

/**
 * Hook personalizado para gestionar los datos de desempeño de meseros.
 * @param {string} waiterId - ID del mesero seleccionado.
 * @param {string} date - Fecha en formato YYYY-MM-DD.
 * @param {string} shift - Turno seleccionado (ej. 'Todos', 'Desayuno').
 */
export const useWaiterRadiography = (waiterId, date, tableNumber = null, shift = 'Todos') => {
    const [waiters, setWaiters] = useState([]);
    const [radiography, setRadiography] = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingWaiters, setLoadingWaiters] = useState(false);
    const [loadingTables, setLoadingTables] = useState(false);
    const [error, setError] = useState(null);

    // Función para obtener la lista de todos los meseros
    const fetchWaiters = useCallback(async () => {
        setLoadingWaiters(true);
        try {
            const { data } = await api.get('/waiter-stats/get-allwaiters', {
                params: { date }
            });
            setWaiters(data);
        } catch (err) {
            console.error("Error al obtener la lista de meseros:", err);
            setError("No se pudo cargar la lista de meseros");
        } finally {
            setLoadingWaiters(false);
        }
    }, [date]);

     const fetchTables = useCallback(async () => {
        if (!waiterId) {
            setTables([]); // Limpia mesas si no hay mesero
            return;
        }
        setLoadingTables(true);
        try {
            const { data } = await api.get('/waiter-stats/get-waitertables', {
                params: { waiterId, date }
            });
            setTables(data);
        } catch (err) {
            console.error("Error al obtener mesas:", err);
        } finally {
            setLoadingTables(false);
        }
    }, [waiterId, date]);
    

    // Función para obtener la radiografía detallada del desempeño
    const fetchRadiography = useCallback(async () => {
        if (!waiterId) return;
        
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/waiter-stats/get-waitersradiography', {
                 params: { waiterId, date, shift, tableNumber }
            });
            setRadiography(data);
        } catch (err) {
            console.error("Error al obtener la radiografía:", err);
            setError("Error al obtener los detalles del desempeño");
        } finally {
            setLoading(false);
        }
       }, [waiterId, date, shift, tableNumber]);

    useEffect(() => { fetchWaiters(); }, [fetchWaiters]);
    useEffect(() => { fetchTables(); }, [fetchTables]);
    useEffect(() => { fetchRadiography(); }, [fetchRadiography]);

    return {
        waiters,
        radiography,
        tables,
        loading,
        loadingWaiters,
        loadingTables,
        error,
    };
};