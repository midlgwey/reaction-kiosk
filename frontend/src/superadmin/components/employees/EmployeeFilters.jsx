// frontend/src/admin/components/employees/EmployeeFilters.jsx
import React from 'react';

export const EmployeeFilters = ({
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  selectedArea, setSelectedArea,
  selectedPosition, setSelectedPosition,
  hasActiveFilters, onClearFilters
}) => (
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

    {/* Filtro por Área */}
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
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold whitespace-nowrap underline px-1"
          title="Limpiar filtros"
        >
          Limpiar
        </button>
      )}
    </div>

  </div>
);