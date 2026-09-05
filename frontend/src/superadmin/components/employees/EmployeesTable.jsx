// frontend/src/admin/components/employees/EmployeesTable.jsx
import React from 'react';
import { useEmployeesTable } from '../../../admin/hooks/employees/useEmployeesTable';
import { EmployeeFilters } from './EmployeeFilters';
import { EmployeeRow } from './EmployeeRow';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import RegisterEmployees from './RegisterEmployees';

const ChartLoading = () => (
  <div className="h-full w-full min-h-[200px] flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3" />
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando datos...</span>
  </div>
);

export default function EmployeesTable() {
  const {
    loading, error,
    filteredAndSortedUsers,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    selectedArea, setSelectedArea,
    selectedPosition, setSelectedPosition,
    hasActiveFilters, handleClearFilters,
    isModalOpen, setIsModalOpen,
    modalMode, selectedUser,
    handleOpenCreate, handleOpenEdit,
    handleSaveEmployee,
    deleteConfirmModal, setDeleteConfirmModal,
    isDeleting, handleOpenDeleteConfirm, handleConfirmDelete,
  } = useEmployeesTable();

  return (
    <div className="w-full font-sans antialiased space-y-6">

      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight border-l-4 border-indigo-600 pl-4">
            Panel de Empleados
          </h1>
          <p className="text-sm mt-1 text-gray-500">Gestión y registro del personal para el restaurante</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded-md bg-[#6A64F1] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#5b55e0] active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Empleado
        </button>
      </div>

      {/* Mensaje de Error */}
      {error && <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

      {/* Filtros */}
      <EmployeeFilters
        searchTerm={searchTerm}           setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}       setStatusFilter={setStatusFilter}
        selectedArea={selectedArea}       setSelectedArea={setSelectedArea}
        selectedPosition={selectedPosition} setSelectedPosition={setSelectedPosition}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Tabla con Scroll Interno y Encabezado Fijo */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="overflow-x-auto max-h-[58vh] overflow-y-auto">
          <table className="min-w-full text-left leading-normal relative">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Empleado</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Puesto / Área</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Teléfono</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Fecha de ingreso</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Estado</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 bg-gray-50">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                /* Loading */
                <tr>
                  <td colSpan={6} className="py-6 px-4">
                    <ChartLoading />
                  </td>
                </tr>
              ) : filteredAndSortedUsers.length === 0 ? (
                /* Sin resultados */
                <tr>
                  <td colSpan={6} className="py-20 text-center italic text-slate-400">
                    No se encontraron empleados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                /* Filas de empleados */
                filteredAndSortedUsers.map((user) => (
                  <EmployeeRow
                    key={user.employee_id}
                    user={user}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDeleteConfirm}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        userName={deleteConfirmModal.userName}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmModal({ isOpen: false, userId: null, userName: '' })}
      />

      {/* Modal de registro / edición */}
      <RegisterEmployees
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={selectedUser}
        mode={modalMode}
        isSubmitting={loading}
      />

    </div>
  );
}