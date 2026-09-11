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

  // Abrir empleado y cargar su historial
  const handleOpenEmployee = async (employee) => {
    setSelectedEmployee(employee);
    try {
      await getEmployeeSales(employee.employee_id, selectedMonth);
    } catch {
      toast.error('Error al cargar el historial');
    }
  };

  // Abrir modal para registrar/editar venta de empleado
  const handleOpenRegister = (sale = null) => {
    setSelectedEmployee(null);
    setEditingSale(sale);
    setIsRegisterModalOpen(true);
  };

  // Guardar venta de empleado
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

  // Abrir modal para registrar chiles del admin
  const handleOpenAdminChilesModal = () => {
    setEditingAdminSale(null);
    setIsAdminChilesModalOpen(true);
  };

  // Guardar chiles del admin
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

  // Editar registro de admin sales
  const handleEditAdminSale = (adminSale) => {
    setEditingAdminSale(adminSale);
    setIsAdminChilesModalOpen(true);
  };

  // Eliminar registro de admin sales
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

  // Configurar nueva temporada
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

  // Abrir modal de metas mensuales
  const handleOpenMonthlyGoals = async () => {
    try {
      await getMonthlyGoals(selectedMonth);
    } catch {}
    setIsMonthlyGoalsOpen(true);
  };

  // Guardar metas mensuales
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

  // Actualizar meta global
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
    isSetupModalOpen, setIsSetupModalOpen,
    isMonthlyGoalsOpen, setIsMonthlyGoalsOpen,
    isGlobalGoalOpen, setIsGlobalGoalOpen,
    selectedEmployee, setSelectedEmployee,
    editingSale, setEditingSale,
    editingAdminSale, setEditingAdminSale,
    // Handlers empleados
    handleOpenEmployee, handleOpenRegister,
    handleSaveSale, handleSetupSeason,
    handleOpenMonthlyGoals, handleSaveMonthlyGoals,
    handleUpdateGlobalGoal,
    // Handlers admin sales
    handleOpenAdminChilesModal,
    handleSaveAdminSale, handleEditAdminSale, handleDeleteAdminSale,
    // Derivados
    noActiveSeason: !dashboard && !loading,
    monthConfigured: dashboard?.month_configured || false,
    monthsConfigured: dashboard?.months_configured || [],
  };
};