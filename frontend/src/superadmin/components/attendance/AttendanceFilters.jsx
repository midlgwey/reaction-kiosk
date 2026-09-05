// frontend/src/admin/components/attendance/AttendanceFilters.jsx
import React from 'react';

export const AttendanceFilters = ({
  selectedArea, setSelectedArea,
  selectedPosition, setSelectedPosition,
  hasActiveFilters, onClearFilters
}) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 w-full">

      {/* Filtro por Área */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
          Filtrar por Área
        </label>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Todas las áreas</option>
          <option value="Comedor">Comedor</option>
          <option value="Barra">Barra</option>
          <option value="Caja">Caja</option>
        </select>
      </div>

      {/* Filtro por Puesto */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
          Filtrar por Puesto
        </label>
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Todos los puestos</option>
          <option value="Capitan">Capitan</option>
          <option value="Mesero">Mesero</option>
          <option value="Ayudante de Mesero">Ayudante de Mesero</option>
          <option value="Bartender">Bartender</option>
          <option value="Hostess">Hostess</option>
          <option value="Capturista">Capturista</option>
          <option value="Limpieza">Limpieza</option>
        </select>
      </div>

    </div>

    {/* Botón para limpiar filtros si hay alguno activo */}
    {hasActiveFilters && (
      <button
        onClick={onClearFilters}
        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline self-end sm:self-center pt-2 sm:pt-0"
      >
        Limpiar filtros
      </button>
    )}
  </div>
);