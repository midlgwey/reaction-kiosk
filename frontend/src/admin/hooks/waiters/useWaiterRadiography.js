import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

/**
 * Hook personalizado para gestionar los datos de desempeño de meseros.
 * @param {string} waiterId - ID del mesero seleccionado.
 * @param {string} date - Fecha en formato YYYY-MM-DD.
 * @param {string} shift - Turno seleccionado (ej. 'Todos', 'Desayuno').
 */
export const useWaiterRadiography = (waiterId, date, shift = 'Todos') => {
    const [waiters, setWaiters] = useState([]);
    const [radiography, setRadiography] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingWaiters, setLoadingWaiters] = useState(false);
    const [error, setError] = useState(null);

    // Función para obtener la lista de todos los meseros
    const fetchWaiters = useCallback(async () => {
        setLoadingWaiters(true);
        try {
            const { data } = await api.get('/waiter-stats/get-allwaiters');
            setWaiters(data);
        } catch (err) {
            console.error("Error al obtener la lista de meseros:", err);
            setError("No se pudo cargar la lista de meseros");
        } finally {
            setLoadingWaiters(false);
        }
    }, []);

    // Función para obtener la radiografía detallada del desempeño
    const fetchRadiography = useCallback(async () => {
        if (!waiterId) return;
        
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/waiter-stats/get-waitersradiography', {
                params: { waiterId, date, shift }
            });
            setRadiography(data);
        } catch (err) {
            console.error("Error al obtener la radiografía:", err);
            setError("Error al obtener los detalles del desempeño");
        } finally {
            setLoading(false);
        }
    }, [waiterId, date, shift]);

    // Carga inicial de meseros
    useEffect(() => {
        fetchWaiters();
    }, [fetchWaiters]);

    // Recarga de estadísticas cuando cambian los parámetros
    useEffect(() => {
        fetchRadiography();
    }, [fetchRadiography]);

    return {
        waiters,
        radiography,
        loading,
        loadingWaiters,
        error,
        refresh: fetchRadiography
    };
};