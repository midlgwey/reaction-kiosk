// frontend/src/admin/pages/SalesPage.jsx
import React from 'react';
import { SalesHeader } from '../components/sales/SalesHeader';
import { GlobalProgressCard } from '../components/sales/GlobalProgressCard';
import { SalesTable } from '../components/sales/SalesTable';
import { RegisterSaleModal } from '../components/sales/RegisterSalesModal';
import { EmployeeSalesModal } from '../components/sales/EmployeesSalesModal';
import { MonthlyGoalsModal } from '../components/sales/MonthlyGoalsModal';
import { GlobalGoalModal } from '../components/sales/GlobalGoalModal';
import { SetupSeasonModal } from '../components/sales/SetupSeasonModal';
import { AdminChilesModal } from '../components/sales/AdminChilesModal';
import { AdminSalesHistoryTable } from '../components/sales/AdminSalesHistoryTable';
import { ChartLoading } from '../../admin/components/ui/ChartLoading';
import { useSalesPage } from '../../admin/hooks/sales/useSalesPage';
import { MONTH_OPTIONS } from '../../admin/utils/salesUtils';

export default function SalesPage() {
  const {
    // Roles y pins
    userRole,
    registroPinVerified, registroPinExpireTime, registroPinError,
    verifyRegistroPin, verifyModificacionPin, canEditWithoutPin,
    // Dashboard
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
    // Handlers
    handleOpenEmployee, handleOpenRegister,
    handleSaveSale, handleSetupSeason,
    handleOpenMonthlyGoals, handleSaveMonthlyGoals,
    handleUpdateGlobalGoal,
    handleOpenAdminChilesModal,
    handleSaveAdminSale, handleEditAdminSale, handleDeleteAdminSale,
    // Derivados
    noActiveSeason, monthConfigured, monthsConfigured,
  } = useSalesPage();
 
  return (
    <div className="p-6 max-w-7xl mx-auto">
 
      {/* Mostrar contenido solo si hay dashboard */}
      {dashboard ? (
        <>
          {/* Encabezado y selector de mes */}
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
            onOpenGlobalGoal={() => setIsGlobalGoalOpen(true)}
            noActiveSeason={noActiveSeason}
            monthConfigured={monthConfigured}
            loading={loading}
          />

          {/* Aviso mes sin configurar */}
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
 
          {/* Cards de progreso global y del equipo */}
          <GlobalProgressCard
            globalGoal={dashboard.season.global_goal}
            globalSold={dashboard.global_sold}
            globalPercentage={dashboard.global_percentage}
            teamGoal={dashboard.season.team_goal}
            teamSold={dashboard.team_sold}
            teamPercentage={dashboard.team_percentage}
            elapsedWorkDays={dashboard.elapsed_work_days}
            totalWorkDays={dashboard.total_work_days}
            employees={dashboard.employees}
            selectedMonth={selectedMonth}
            adminSales={adminSales}
          />
 
          {/* Tabla de rendimiento individual de empleados */}
          <SalesTable
            employees={dashboard.employees}
            userRole={userRole}
            loading={loading}
            onViewEmployee={handleOpenEmployee}
            onEditSale={handleOpenRegister}
          />

          {/* Sección de admin - registrar sus propios chiles */}
          {userRole === 'admin' && (
            <div className="mt-10">
              {/* Tabla de historial de admin sales - Siempre visible */}
              <div className="mb-6">
                <AdminSalesHistoryTable
                  adminSales={adminSales}
                  onEdit={handleEditAdminSale}
                  onDelete={handleDeleteAdminSale}
                  loading={loading}
                />
              </div>

              {/* Botón para registrar chiles - Debajo de la tabla */}
              <div className="flex justify-end">
                <button
                  onClick={handleOpenAdminChilesModal}
                  className="bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
                >
                  Registrar Mis Chiles
                </button>
              </div>
            </div>
          )}
        </>
      ) : loading ? (
        // Mostrar ChartLoading mientras está cargando
        <div className="mt-12">
          <ChartLoading />
        </div>
      ) : null}
 
      {/* Modal - Registrar / Editar venta de empleado */}
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
 
      {/* Modal - Historial de ventas del empleado */}
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
 
      {/* Modal - Configurar temporada */}
      <SetupSeasonModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSave={handleSetupSeason}
        loading={loading}
      />
 
      {/* Modal - Metas mensuales */}
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
 
      {/* Modal - Cambiar Meta Global */}
      <GlobalGoalModal
        isOpen={isGlobalGoalOpen}
        onClose={() => setIsGlobalGoalOpen(false)}
        onSave={handleUpdateGlobalGoal}
        currentGoal={dashboard?.season?.global_goal}
        loading={loading}
      />

      {/* Modal - Registrar mis chiles (admin) */}
      <AdminChilesModal
        isOpen={isAdminChilesModalOpen}
        onClose={() => { setIsAdminChilesModalOpen(false); setEditingAdminSale(null); }}
        onSave={handleSaveAdminSale}
        loading={loading}
        editingAdminSale={editingAdminSale}
      />
 
    </div>
  );
}