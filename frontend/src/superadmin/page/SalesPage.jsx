// frontend/src/admin/pages/SalesPage.jsx
import React, { useState, useEffect } from 'react';
import { SalesHeader } from '../components/sales/SalesHeader';
import { GlobalProgressCard } from '../components/sales/GlobalProgressCard';
import { SalesTable } from '../components/sales/SalesTable';
import { RegisterSaleModal } from '../components/sales/RegisterSalesModal';
import { EmployeeSalesModal } from '../components/sales/EmployeesSalesModal';
import { SetupSeasonModal } from '../components/sales/SetupSeasonModal';
import { useSales } from '../../admin/hooks/sales/useSales';
import toast from 'react-hot-toast';

const CURRENT_MONTH = new Date().getMonth(); // 7=Ago, 8=Sep, 9=Oct
const MONTH_OPTIONS = [
  { label: 'Agosto', value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre', value: '10' },
];

export const SalesPage = () => {
  const userRole = localStorage.getItem('userRole') || 'supervisor';
  const year = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(
    MONTH_OPTIONS.find(m => parseInt(m.value) === CURRENT_MONTH + 1)?.value || '08'
  );
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingSale, setEditingSale] = useState(null);

  const {
    loading,
    dashboard,
    seasonData,
    employeeSales,
    getDashboard,
    getActiveSeason,
    getEmployeeSales,
    registerSale,
    updateSale,
    setupSeason
  } = useSales();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await getDashboard();
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          await getActiveSeason();
        } catch {
          // No hay temporada activa
        }
      }
    }
  };

  const handleOpenEmployee = async (employee) => {
    setSelectedEmployee(employee);
    try {
      await getEmployeeSales(employee.employee_id, `${year}-${selectedMonth}`);
    } catch {
      toast.error('Error al cargar el historial');
    }
  };

  const handleOpenRegister = (sale = null) => {
    setEditingSale(sale);
    setIsRegisterModalOpen(true);
  };

  const handleSaveSale = async (payload) => {
    try {
      if (editingSale) {
        await updateSale(editingSale.sale_id, payload);
        toast.success('Venta actualizada correctamente');
      } else {
        await registerSale(payload);
        toast.success('Venta registrada correctamente');
      }
      setIsRegisterModalOpen(false);
      setEditingSale(null);
      await getDashboard();
      if (selectedEmployee) {
        await getEmployeeSales(selectedEmployee.employee_id, `${year}-${selectedMonth}`);
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
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al configurar la temporada');
    }
  };

  const handleMonthChange = async (month) => {
    setSelectedMonth(month);
    if (selectedEmployee) {
      await getEmployeeSales(selectedEmployee.employee_id, `${year}-${month}`);
    }
  };

  const noActiveSeason = !dashboard && !loading;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SalesHeader
        season={dashboard?.season}
        selectedMonth={selectedMonth}
        monthOptions={MONTH_OPTIONS}
        onMonthChange={handleMonthChange}
        userRole={userRole}
        onRegisterSale={() => handleOpenRegister(null)}
        onSetupSeason={() => setIsSetupModalOpen(true)}
        noActiveSeason={noActiveSeason}
        loading={loading}
      />

      {dashboard ? (
        <>
          <GlobalProgressCard
            globalGoal={dashboard.season.global_goal}
            globalSold={dashboard.global_sold}
            globalPercentage={dashboard.global_percentage}
            teamGoal={dashboard.season.team_goal}
            elapsedWorkDays={dashboard.elapsed_work_days}
            totalWorkDays={dashboard.total_work_days}
          />

          <SalesTable
            employees={dashboard.employees}
            userRole={userRole}
            selectedMonth={selectedMonth}
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
      />

      <SetupSeasonModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSave={handleSetupSeason}
        loading={loading}
      />
    </div>
  );
};

export default SalesPage;