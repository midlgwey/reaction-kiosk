// frontend/src/admin/pages/SalesPage.jsx
import React, { useState, useEffect } from 'react';
import { SalesHeader } from '../components/sales/SalesHeader';
import { GlobalProgressCard } from '../components/sales/GlobalProgressCard';
import { SalesTable } from '../components/sales/SalesTable';
import { RegisterSaleModal } from '../components/sales/RegisterSalesModal';
import { EmployeeSalesModal } from '../components/sales/EmployeesSalesModal';
import { MonthlyGoalsModal } from '../components/sales/MonthlyGoalsModal';
import { SetupSeasonModal } from '../components/sales/SetupSeasonModal';
import { useSales } from '../../admin/hooks/sales/useSales';
import { useSalesPins } from '../../admin/hooks/sales/useSalesPins';
import toast from 'react-hot-toast';

const MONTH_OPTIONS = [
  { label: 'Agosto',     value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre',    value: '10' },
];

const getCurrentMonth = () => {
  const m = new Date().getMonth() + 1;
  if (m < 8) return '08';
  if (m > 10) return '10';
  return String(m).padStart(2, '0');
};


export const SalesPage = () => {
  const userRole = localStorage.getItem('userRole') || 'supervisor';

  const {
    registroPinVerified,
    registroPinExpireTime,
    registroPinError,
    verifyRegistroPin,
    verifyModificacionPin,
    canEditWithoutPin
  } = useSalesPins();

  const [selectedMonth, setSelectedMonth]             = useState(getCurrentMonth());
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen]       = useState(false);
  const [isMonthlyGoalsOpen, setIsMonthlyGoalsOpen]   = useState(false);
  const [selectedEmployee, setSelectedEmployee]       = useState(null);
  const [editingSale, setEditingSale]                 = useState(null);

  const {
    loading,
    dashboard,
    employeeSales,
    getDashboard,
    getActiveSeason,
    getEmployeeSales,
    registerSale,
    updateSale,
    setupSeason,
    saveMonthGoals,
    getMonthlyGoals,
    monthlyGoals
  } = useSales();

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

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

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
      setIsMonthlyGoalsOpen(true);
    } catch {
      setIsMonthlyGoalsOpen(true);
    }
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

  const noActiveSeason = !dashboard && !loading;
  const monthConfigured = dashboard?.month_configured || false;
  const monthsConfigured = dashboard?.months_configured || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SalesHeader
        season={dashboard?.season}
        selectedMonth={selectedMonth}
        monthOptions={MONTH_OPTIONS}
        monthsConfigured={monthsConfigured}
        onMonthChange={handleMonthChange}
        userRole={userRole}
        onRegisterSale={() => handleOpenRegister(null)}
        onSetupSeason={() => setIsSetupModalOpen(true)}
        onConfigMonthlyGoals={handleOpenMonthlyGoals}
        noActiveSeason={noActiveSeason}
        monthConfigured={monthConfigured}
        loading={loading}
      />

      {dashboard ? (
        <>
          {!monthConfigured && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-amber-700">
                No hay metas configuradas para este mes.
              </p>
              {userRole === 'admin' && (
                <button
                  onClick={handleOpenMonthlyGoals}
                  className="text-sm font-semibold text-amber-700 underline hover:text-amber-900"
                >
                  Configurar ahora →
                </button>
              )}
            </div>
          )}

          <GlobalProgressCard
            globalGoal={dashboard.season.global_goal}
            globalSold={dashboard.global_sold}
            globalPercentage={dashboard.global_percentage}
            teamGoal={dashboard.season.team_goal}
            elapsedWorkDays={dashboard.elapsed_work_days}
            totalWorkDays={dashboard.total_work_days}
            employees={dashboard.employees}  
            selectedMonth={selectedMonth}
          />

          <SalesTable
            employees={dashboard.employees}
            userRole={userRole}
            onViewEmployee={handleOpenEmployee}
            onEditSale={handleOpenRegister}
          />
        </>
      ) : !loading && (
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-lg">No hay una temporada activa.</p>
          {userRole === 'admin' && (
            <button
              onClick={() => setIsSetupModalOpen(true)}
              className="mt-4 bg-[#6A64F1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5b55e0] transition-colors"
            >
              Configurar Temporada
            </button>
          )}
        </div>
      )}

       <RegisterSaleModal
        isOpen={isRegisterModalOpen}
        onClose={() => { setIsRegisterModalOpen(false); setEditingSale(null); }}
        onSave={handleSaveSale}
        employees={dashboard?.employees || []}
        editingSale={editingSale}
        userRole={userRole}
        loading={loading}
        registroPinVerified={registroPinVerified}
        registroPinExpireTime={registroPinExpireTime}
        onVerifyPin={verifyRegistroPin}
        pinError={registroPinError}
      />

      <EmployeeSalesModal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
        sales={employeeSales}
        selectedMonth={selectedMonth}
        monthOptions={MONTH_OPTIONS}
        onMonthChange={handleMonthChange}
        onEditSale={handleOpenRegister}
        userRole={userRole}
        canEditWithoutPin={canEditWithoutPin}
        onRequestModificacionPin={verifyModificacionPin}
    
      />


      <SetupSeasonModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSave={handleSetupSeason}
        loading={loading}
      />

      <MonthlyGoalsModal
        isOpen={isMonthlyGoalsOpen}
        onClose={() => setIsMonthlyGoalsOpen(false)}
        onSave={handleSaveMonthlyGoals}
        selectedMonth={selectedMonth}
        monthOptions={MONTH_OPTIONS}
        existingGoals={monthlyGoals?.goals || []}
        season={dashboard?.season}
        loading={loading}
      />
    </div>
  );
};

export default SalesPage;