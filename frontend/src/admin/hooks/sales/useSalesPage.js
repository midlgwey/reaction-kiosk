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
    loading, dashboard, employeeSales, adminSales, monthlyGoals,
    getDashboard, getActiveSeason, getEmployeeSales, getAdminSalesHistory,
    registerSale, updateSale, setupSeason, saveMonthGoals, getMonthlyGoals,
    updateGlobalGoal, registerAdminSale, updateAdminSaleRecord, removeAdminSale
  } = useSales();

  const [selectedMonth, setSelectedMonth]           = useState(getCurrentMonth());
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAdminChilesModalOpen, setIsAdminChilesModalOpen] = useState(false);
  const [isAdminHistoryOpen, setIsAdminHistoryOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen]     = useState(false);
  const [isMonthlyGoalsOpen, setIsMonthlyGoalsOpen] = useState(false);
  const [isGlobalGoalOpen, setIsGlobalGoalOpen]     = useState(false);
  const [selectedEmployee, setSelectedEmployee]     = useState(null);
  const [editingSale, setEditingSale]               = useState(null);
  const [editingAdminSale, setEditingAdminSale]     = useState(null);

  useEffect(() => {
    loadDashboard(selectedMonth);
    if (userRole === 'admin') {
      loadAdminSalesHistory(selectedMonth);
    }
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

  const loadAdminSalesHistory = async (month) => {
    try {
      await getAdminSalesHistory(month);
    } catch {
      console.error('Error loading admin sales history');
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

  // ─── Admin Sales Handlers ─────────────────────────────────────────
  const handleOpenAdminChilesModal = () => {
    setEditingAdminSale(null);
    setIsAdminChilesModalOpen(true);
  };

  const handleOpenAdminHistory = async () => {
    try {
      await loadAdminSalesHistory(selectedMonth);
      setIsAdminHistoryOpen(true);
    } catch {
      toast.error('Error al cargar el historial');
    }
  };

  const handleSaveAdminSale = async (payload) => {
    try {
      if (editingAdminSale?.admin_sale_id) {
        await updateAdminSaleRecord(editingAdminSale.admin_sale_id, payload);
        toast.success('Registro actualizado correctamente');
      } else {
        await registerAdminSale(payload);
        toast.success('Chiles registrados correctamente');
      }
      setIsAdminChilesModalOpen(false);
      setEditingAdminSale(null);
      await loadDashboard(selectedMonth);
      await loadAdminSalesHistory(selectedMonth);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleEditAdminSale = (adminSale) => {
    setEditingAdminSale(adminSale);
    setIsAdminChilesModalOpen(true);
  };

  const handleDeleteAdminSale = async (admin_sale_id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro?')) return;

    try {
      await removeAdminSale(admin_sale_id);
      toast.success('Registro eliminado correctamente');
      await loadAdminSalesHistory(selectedMonth);
      await loadDashboard(selectedMonth);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  // ─── End Admin Sales Handlers ────────────────────────────────────

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
    loading, dashboard, employeeSales, adminSales, monthlyGoals,
    selectedMonth, handleMonthChange,
    // Modales
    isRegisterModalOpen, setIsRegisterModalOpen,
    isAdminChilesModalOpen, setIsAdminChilesModalOpen,
    isAdminHistoryOpen, setIsAdminHistoryOpen,
    isSetupModalOpen,    setIsSetupModalOpen,
    isMonthlyGoalsOpen,  setIsMonthlyGoalsOpen,
    isGlobalGoalOpen,    setIsGlobalGoalOpen,
    selectedEmployee,    setSelectedEmployee,
    editingSale,         setEditingSale,
    editingAdminSale,    setEditingAdminSale,
    // Handlers empleados
    handleOpenEmployee, handleOpenRegister,
    handleSaveSale,     handleSetupSeason,
    handleOpenMonthlyGoals, handleSaveMonthlyGoals,
    handleUpdateGlobalGoal,
    // Handlers admin sales
    handleOpenAdminChilesModal, handleOpenAdminHistory,
    handleSaveAdminSale, handleEditAdminSale, handleDeleteAdminSale,
    // Derivados
    noActiveSeason:   !dashboard && !loading,
    monthConfigured:  dashboard?.month_configured  || false,
    monthsConfigured: dashboard?.months_configured || [],
  };
};