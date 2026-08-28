// frontend/src/admin/hooks/sales/useSales.js
import { useState, useCallback } from 'react';
import {
  fetchActiveSeason,
  fetchSalesDashboard,
  fetchEmployeeSales,
  createSeason,
  postDailySale,
  patchDailySale
} from '../../services/salesService';

export const useSales = () => {
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [seasonData, setSeasonData]     = useState(null);
  const [dashboard, setDashboard]       = useState(null);
  const [employeeSales, setEmployeeSales] = useState([]);

  // Obtener temporada activa + metas individuales
  const getActiveSeason = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchActiveSeason();
      setSeasonData(data);
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        setSeasonData(null);
      } else {
        setError(err.response?.data?.message || 'Error al cargar la temporada');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Dashboard con semáforo
  const getDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchSalesDashboard();
      setDashboard(data);
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        setDashboard(null);
      } else {
        setError(err.response?.data?.message || 'Error al cargar el dashboard');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Historial de ventas de un empleado
  const getEmployeeSales = useCallback(async (employee_id, month) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchEmployeeSales(employee_id, month);
      setEmployeeSales(data.sales);
      return data.sales;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar ventas del empleado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear temporada + metas individuales
  const setupSeason = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await createSeason(payload);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la temporada');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar venta diaria
  const registerSale = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await postDailySale(payload);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar la venta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Modificar venta existente
  const updateSale = useCallback(async (sale_id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await patchDailySale(sale_id, payload);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la venta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    seasonData,
    dashboard,
    employeeSales,
    getActiveSeason,
    getDashboard,
    getEmployeeSales,
    setupSeason,
    registerSale,
    updateSale
  };
};