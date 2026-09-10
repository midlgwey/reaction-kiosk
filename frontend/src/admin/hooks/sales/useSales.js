// frontend/src/admin/hooks/sales/useSales.js
import { useState, useCallback } from 'react';
import {
  fetchActiveSeason,
  fetchSalesDashboard,
  fetchEmployeeSales,
  fetchMonthlyGoals,
  fetchAdminSales,
  createSeason,
  saveMonthlyGoals,
  postDailySale,
  patchDailySale,
  patchGlobalGoal,
  postAdminSale,
  patchAdminSale,
  deleteAdminSale
} from '../../services/salesService';
 
export const useSales = () => {
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [seasonData, setSeasonData]       = useState(null);
  const [dashboard, setDashboard]         = useState(null);
  const [employeeSales, setEmployeeSales] = useState([]);
  const [adminSales, setAdminSales]       = useState([]);
  const [monthlyGoals, setMonthlyGoals]   = useState(null);
 
  const getActiveSeason = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchActiveSeason();
      setSeasonData(data);
      return data;
    } catch (err) {
      if (err.response?.status === 404) setSeasonData(null);
      else setError(err.response?.data?.message || 'Error al cargar la temporada');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 
  const getDashboard = useCallback(async (month) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchSalesDashboard(month);
      setDashboard(data);
      return data;
    } catch (err) {
      if (err.response?.status === 404) setDashboard(null);
      else setError(err.response?.data?.message || 'Error al cargar el dashboard');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 
  const getMonthlyGoals = useCallback(async (month) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchMonthlyGoals(month);
      setMonthlyGoals(data);
      return data;
    } catch (err) {
      if (err.response?.status === 404) setMonthlyGoals(null);
      else setError(err.response?.data?.message || 'Error al cargar metas del mes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 
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
 
  const getAdminSalesHistory = useCallback(async (month) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchAdminSales(month);
      setAdminSales(data.admin_sales);
      return data.admin_sales;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar historial del admin');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 
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
 
  const saveMonthGoals = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await saveMonthlyGoals(payload);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar metas del mes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 
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
 
  const registerAdminSale = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await postAdminSale(payload);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar chiles');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 
  const updateAdminSaleRecord = useCallback(async (admin_sale_id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await patchAdminSale(admin_sale_id, payload);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el registro');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 
  const removeAdminSale = useCallback(async (admin_sale_id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await deleteAdminSale(admin_sale_id);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el registro');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 
  const updateGlobalGoal = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await patchGlobalGoal(payload);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la meta global');
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
    adminSales,
    monthlyGoals,
    getActiveSeason,
    getDashboard,
    getMonthlyGoals,
    getEmployeeSales,
    getAdminSalesHistory,
    setupSeason,
    saveMonthGoals,
    registerSale,
    updateSale,
    registerAdminSale,
    updateAdminSaleRecord,
    removeAdminSale,
    updateGlobalGoal
  };
};
 