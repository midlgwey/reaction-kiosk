// frontend/src/admin/hooks/sales/useSalesPage.js
import { useState, useEffect } from 'react';
import { useSales } from './useSales';
import { useSalesPins } from './useSalesPins';
import { getCurrentMonth } from '../../utils/salesUtils';
import toast from 'react-hot-toast';

export const useSalesPage = () => {
  const userRole = localStorage.getItem('userRole') || 'supervisor';

  const {
    registroPinVerified,
    registroPinExpireTime,
    registroPinError,
    verifyRegistroPin,
    verifyModificacionPin,
    canEditWithoutPin
  } = useSalesPins();

  const {
    loading, dashboard, employeeSales, monthlyGoals,
    getDashboard, getActiveSeason, getEmployeeSales,
    registerSale, updateSale, setupSeason, saveMonthGoals, getMonthlyGoals,
    updateGlobalGoal
  } = useSales();

  const [selectedMonth, setSelectedMonth]           = useState(getCurrentMonth());
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen]     = useState(false);
  const [isMonthlyGoalsOpen, setIsMonthlyGoalsOpen] = useState(false);
  const [isGlobalGoalOpen, setIsGlobalGoalOpen]     = useState(false);
  const [selectedEmployee, setSelectedEmployee]     = useState(null);
  const [editingSale, setEditingSale]               = useState(null);

  useEffect(() => {
    loadDashboard(selectedMonth);
  }, [selectedMonth]);

  const loadDashboard = async (month) => {
    try {
      await getDashboard(month);
    } catch (err) {
      if (err.response?.status === 404) {
        try { await getActiveSeason(); } catch {}
      }
    }
  };

  const handleMonthChange = (month) => setSelectedMonth(month);

  const handleOpenEmployee = async (employee) => {
    setSelectedEmployee(employee);
    try {
      await getEmployeeSales(employee.employee_id, selectedMonth);
    } catch {
      toast.error('Error al cargar el historial');
    }
  };

  const handleOpenRegister = (sale = null) => {
    setSelectedEmployee(null);
    setEditingSale(sale);
    setIsRegisterModalOpen(true);
  };

  const handleSaveSale = async (payload) => {
    try {
      if (editingSale?.sale_id) {
        await updateSale(editingSale.sale_id, payload);
        toast.success('Venta actualizada correctamente');
      } else {
        await registerSale(payload);
        toast.success('Venta registrada correctamente');
      }
      setIsRegisterModalOpen(false);
      setEditingSale(null);
      await loadDashboard(selectedMonth);
      if (selectedEmployee) {
        await getEmployeeSales(selectedEmployee.employee_id, selectedMonth);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar la venta');
    }
  };

  const handleSetupSeason = async (payload) => {
    try {
      await setupSeason(payload);
      toast.success('Temporada configurada correctamente');
      setIsSetupModalOpen(false);
      await loadDashboard(selectedMonth);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al configurar la temporada');
    }
  };

  const handleOpenMonthlyGoals = async () => {
    try {
      await getMonthlyGoals(selectedMonth);
    } catch {}
    setIsMonthlyGoalsOpen(true);
  };

  const handleSaveMonthlyGoals = async (payload) => {
    try {
      await saveMonthGoals(payload);
      toast.success('Metas del mes guardadas correctamente');
      setIsMonthlyGoalsOpen(false);
      await loadDashboard(selectedMonth);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar las metas');
    }
  };

  const handleUpdateGlobalGoal = async (payload) => {
    try {
      await updateGlobalGoal(payload);
      toast.success('Meta global actualizada correctamente');
      setIsGlobalGoalOpen(false);
      await loadDashboard(selectedMonth);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar la meta global');
    }
  };

  return {
    // Roles y pins
    userRole,
    registroPinVerified, registroPinExpireTime, registroPinError,
    verifyRegistroPin, verifyModificacionPin, canEditWithoutPin,
    // Estado del dashboard
    loading, dashboard, employeeSales, monthlyGoals,
    selectedMonth, handleMonthChange,
    // Modales
    isRegisterModalOpen, setIsRegisterModalOpen,
    isSetupModalOpen,    setIsSetupModalOpen,
    isMonthlyGoalsOpen,  setIsMonthlyGoalsOpen,
    isGlobalGoalOpen,    setIsGlobalGoalOpen,
    selectedEmployee,    setSelectedEmployee,
    editingSale,         setEditingSale,
    // Handlers
    handleOpenEmployee, handleOpenRegister,
    handleSaveSale,     handleSetupSeason,
    handleOpenMonthlyGoals, handleSaveMonthlyGoals,
    handleUpdateGlobalGoal,
    // Derivados
    noActiveSeason:   !dashboard && !loading,
    monthConfigured:  dashboard?.month_configured  || false,
    monthsConfigured: dashboard?.months_configured || [],
  };
};