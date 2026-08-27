// frontend/src/admin/components/employees/EmployeesTable.jsx
import React, { useState, useEffect, useMemo } from 'react';
import RegisterEmployees from './RegisterEmployees';
import { useEmployees } from '../../admin/hooks/employees/useEmployees';
import toast from 'react-hot-toast';

export default function EmployeesTable() {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  // Orden jerárquico definido para los puestos del restaurante
  const positionHierarchy = {
    'Capitan': 1,
    'Mesero': 2,
    'Ayudante de Mesero': 3,
    'Bartender': 4,
    'Hostess': 5,
    'Capturista': 6,
    'Limpieza': 7
  };

  // Estados para modal de registro/edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);

  // Estado para modal de confirmación de eliminación
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, userId: null, userName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Filtrado y ordenamiento optimizado con useMemo
  const filteredAndSortedUsers = useMemo(() => {
    if (!employees) return [];

    const filtered = employees.filter((user) => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const role = (user.position || '').toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = fullName.includes(search) || role.includes(search);
      const matchesStatus = statusFilter === 'Todos' ? true : user.status === statusFilter;
      const matchesArea = selectedArea ? user.work_area === selectedArea : true;
      const matchesPosition = selectedPosition ? user.position === selectedPosition : true;

      return matchesSearch && matchesStatus && matchesArea && matchesPosition;
    });

    // Ordenar por jerarquía de puestos y luego alfabéticamente
    return filtered.sort((a, b) => {
      const orderA = positionHierarchy[a.position] || 99;
      const orderB = positionHierarchy[b.position] || 99;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
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
    setDeleteConfirmModal({
      isOpen: true,
      userId: id,
      userName: `${firstName} ${lastName}`
    });
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
    let result;
    if (modalMode === 'create') {
      result = await addEmployee(formData);
    } else {
      result = await updateEmployee(selectedUser.employee_id, formData);
    }

    if (!result.success) {
      toast.error(result.error);
      return false;
    }
    toast.success('Cambios guardados correctamente');
    return true;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Activo':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Suspended':
      case 'Suspendido':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Inactive':
      case 'Inactivo':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="w-full font-sans antialiased space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight border-l-4 border-indigo-600 pl-4 w-full md:w-auto">
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

      {/* Filtros Avanzados (Búsqueda, Estado, Área y Puesto) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        
        {/* Buscador */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-gray-400">
              <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        {/* Filtro por Estado */}
        <div className="w-full">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm font-medium text-gray-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Active">Activo</option>
            <option value="Inactive">Inactivo</option>
            <option value="Suspended">Suspendido</option>
          </select>
        </div>

        {/* Filtro por Área */}
        <div className="w-full">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm font-medium text-gray-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">Todas las áreas</option>
            <option value="Comedor">Comedor</option>
            <option value="Barra">Barra</option>
            <option value="Caja">Caja</option>
          </select>
        </div>

        {/* Filtro por Puesto */}
        <div className="w-full flex items-center gap-2">
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm font-medium text-gray-700 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">Todos los puestos</option>
            <option value="Capitan">Capitán</option>
            <option value="Mesero">Mesero</option>
            <option value="Ayudante de Mesero">Ayudante de Mesero</option>
            <option value="Bartender">Bartender</option>
            <option value="Hostess">Hostess</option>
            <option value="Capturista">Capturista</option>
            <option value="Limpieza">Limpieza</option>
          </select>

          {/* Botón para resetear filtros si hay alguno activo */}
          {(searchTerm || statusFilter !== 'Todos' || selectedArea || selectedPosition) && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('Todos'); setSelectedArea(''); setSelectedPosition(''); }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold whitespace-nowrap underline px-1"
              title="Limpiar filtros"
            >
              Limpiar
            </button>
          )}
        </div>

      </div>

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
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">Cargando empleados...</td>
                </tr>
              ) : filteredAndSortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">No se encontraron empleados con los filtros seleccionados.</td>
                </tr>
              ) : (
                filteredAndSortedUsers.map((user) => {
                  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.first_name} ${user.last_name}`)}&background=6A64F1&color=fff`;
                  return (
                    <tr key={user.employee_id} className="border-b border-gray-200 transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                          {/* Círculo con las iniciales y los colores solicitados */}
                          <div className="h-10 w-10 rounded-full bg-orange-100 text-indigo-900 font-bold text-sm flex items-center justify-center shadow-sm shrink-0">
                            {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()}
                          </div>
                          <p className="font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="font-medium text-gray-800">{user.position || 'N/A'}</span> {user.work_area ? <span className="text-xs text-gray-500">• {user.work_area}</span> : ''}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {formatPhoneNumber(user.phone_number)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.hire_date ? new Date(user.hire_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(user.status)}`}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs transition-colors hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleOpenDeleteConfirm(user.employee_id, user.first_name, user.last_name)}
                            className="text-red-600 hover:text-red-900 font-semibold text-xs transition-colors hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              Eliminar Empleado
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              ¿Estás seguro de que deseas eliminar a <span className="font-semibold text-gray-900">{deleteConfirmModal.userName}</span>? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmModal({ isOpen: false, userId: null, userName: '' })}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Integrado */}
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