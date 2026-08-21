import React, { useState } from 'react';
import RegisterEmployees from './RegisterEmployees';

const INITIAL_USERS = [
  {
    id: 1,
    name: 'Vera Carpenter',
    role: 'Admin',
    createdAt: 'Jan 21, 2020',
    status: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
  },
  {
    id: 2,
    name: 'Blake Bowman',
    role: 'Editor',
    createdAt: 'Jan 01, 2020',
    status: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
  },
  {
    id: 3,
    name: 'Dana Moore',
    role: 'Editor',
    createdAt: 'Jan 10, 2020',
    status: 'Suspendido',
    avatar: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
  },
  {
    id: 4,
    name: 'Alonzo Cox',
    role: 'Admin',
    createdAt: 'Jan 18, 2020',
    status: 'Inactivo',
    avatar: 'https://images.unsplash.com/photo-1522609925277-66fea332c575?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
  },
];

export default function EmployeesTable() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [entriesPerPage] = useState(5);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  // Filtrado de usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' ? true : user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  // Función para eliminar empleado
  const handleDeleteEmployee = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  const handleSaveEmployee = (formData) => {
    if (modalMode === 'create') {
      const newUser = {
        id: Date.now(),
        name: `${formData.name} ${formData.lastname}`.trim(),
        role: formData.position,
        createdAt: formData.startDate || 'Aug 21, 2026',
        status: formData.status,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
      };
      setUsers([newUser, ...users]);
    } else {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                name: `${formData.name} ${formData.lastname}`.trim(),
                role: formData.position,
                status: formData.status,
              }
            : u
        )
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Suspendido':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Inactivo':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full font-sans antialiased">
      {/* Cabecera con Título y Botón Agregar Empleado */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight border-l-4 border-indigo-600 pl-4 w-full md:w-auto">
           Panel de Personal
          </h1>
          <p className="text-sm mt-2 text-gray-500">Gestión y registro del personal para el restaurante</p>
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

      {/* Controles de Búsqueda y Filtro */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-gray-400">
              <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar empleado o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-12 pr-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none rounded-md border border-[#e0e0e0] bg-white py-3 pl-6 pr-12 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md sm:min-w-[180px]"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Suspendido">Suspendido</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left leading-normal">
            <thead>
              <tr className="bg-gray-50 border-b border-[#e0e0e0]">
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Empleado</th>
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Rol</th>
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Fecha de ingreso</th>
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Estado</th>
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, entriesPerPage).map((user) => (
                <tr key={user.id} className="border-b border-[#e0e0e0] transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-full w-full rounded-full object-cover shadow-sm" src={user.avatar} alt={user.name} />
                      </div>
                      <p className="font-medium text-[#07074D]">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#6B7280]">{user.role}</td>
                  <td className="px-6 py-4 text-[#6B7280]">{user.createdAt}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(user.id)}
                        className="text-red-600 hover:text-red-900 font-medium text-sm transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#e0e0e0] bg-white px-6 py-4 sm:flex-row">
          <span className="text-sm font-medium text-[#6B7280]">
            Mostrando 1 a {Math.min(filteredUsers.length, entriesPerPage)} de {filteredUsers.length} empleados
          </span>
          <div className="inline-flex gap-2">
            <button className="rounded-md border border-[#e0e0e0] bg-white px-4 py-2 text-sm font-medium text-[#07074D] transition-colors hover:bg-gray-50 outline-none">
              Anterior
            </button>
            <button className="rounded-md border border-[#e0e0e0] bg-white px-4 py-2 text-sm font-medium text-[#07074D] transition-colors hover:bg-gray-50 outline-none">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal Integrado */}
      <RegisterEmployees
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={selectedUser}
        mode={modalMode}
      />
    </div>
  );
}