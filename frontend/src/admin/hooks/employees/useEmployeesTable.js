// frontend/src/admin/hooks/employees/useEmployeesTable.js
import { useState, useEffect, useMemo } from 'react';
import { useEmployees } from './useEmployees';
import { positionHierarchy } from '../../utils/employeeUtils';
import toast from 'react-hot-toast';

export const useEmployeesTable = () => {
  const {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    removeEmployee
  } = useEmployees();

  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm]         = useState('');
  const [statusFilter, setStatusFilter]     = useState('Todos');
  const [selectedArea, setSelectedArea]     = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  // Estados para modal de registro/edición
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [modalMode, setModalMode]       = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);

  // Estado para modal de confirmación de eliminación
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false, userId: null, userName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Filtrado y ordenamiento optimizado con useMemo
  const filteredAndSortedUsers = useMemo(() => {
    if (!employees) return [];

    const filtered = employees.filter((user) => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const role     = (user.position || '').toLowerCase();
      const search   = searchTerm.toLowerCase();

      return (
        (fullName.includes(search) || role.includes(search)) &&
        (statusFilter === 'Todos' || user.status === statusFilter) &&
        (!selectedArea     || user.work_area === selectedArea) &&
        (!selectedPosition || user.position  === selectedPosition)
      );
    });

    // Ordenar por jerarquía de puestos y luego alfabéticamente
    return filtered.sort((a, b) => {
      const orderA = positionHierarchy[a.position] || 99;
      const orderB = positionHierarchy[b.position] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return (a.first_name || '').localeCompare(b.first_name || '');
    });
  }, [employees, searchTerm, statusFilter, selectedArea, selectedPosition]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (id, firstName, lastName) => {
    setDeleteConfirmModal({ isOpen: true, userId: id, userName: `${firstName} ${lastName}` });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const res = await removeEmployee(deleteConfirmModal.userId);
    setIsDeleting(false);

    if (res.success) {
      toast.success('Empleado eliminado correctamente');
      setDeleteConfirmModal({ isOpen: false, userId: null, userName: '' });
    } else {
      toast.error(res.error || 'Error al eliminar empleado');
    }
  };

  const handleSaveEmployee = async (formData) => {
    const result = modalMode === 'create'
      ? await addEmployee(formData)
      : await updateEmployee(selectedUser.employee_id, formData);

    if (!result.success) {
      toast.error(result.error);
      return false;
    }
    toast.success('Cambios guardados correctamente');
    return true;
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Todos');
    setSelectedArea('');
    setSelectedPosition('');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'Todos' || selectedArea || selectedPosition;

  return {
    // Data
    loading, error,
    filteredAndSortedUsers,
    // Filtros
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    selectedArea, setSelectedArea,
    selectedPosition, setSelectedPosition,
    hasActiveFilters, handleClearFilters,
    // Modal registro/edición
    isModalOpen, setIsModalOpen,
    modalMode, selectedUser,
    handleOpenCreate, handleOpenEdit,
    handleSaveEmployee,
    // Modal eliminación
    deleteConfirmModal, setDeleteConfirmModal,
    isDeleting, handleOpenDeleteConfirm, handleConfirmDelete,
  };
};