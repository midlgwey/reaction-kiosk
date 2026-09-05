// frontend/src/admin/components/employees/EmployeeRow.jsx
import React from 'react';
import { getStatusBadge, formatPhoneNumber } from '../../../admin/utils/employeeUtils';

export const EmployeeRow = ({ user, onEdit, onDelete }) => (
  <tr className="border-b border-gray-200 transition-colors hover:bg-gray-50">

    {/* Empleado */}
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        {/* Círculo con las iniciales */}
        <div className="h-10 w-10 rounded-full bg-orange-100 text-indigo-900 font-bold text-sm flex items-center justify-center shadow-sm shrink-0">
          {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()}
        </div>
        <p className="font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
      </div>
    </td>

    {/* Puesto / Área */}
    <td className="px-6 py-4 text-gray-600">
      <span className="font-medium text-gray-800">{user.position || 'N/A'}</span>
      {user.work_area && <span className="text-xs text-gray-500"> • {user.work_area}</span>}
    </td>

    {/* Teléfono */}
    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
      {formatPhoneNumber(user.phone_number)}
    </td>

    {/* Fecha de ingreso */}
    <td className="px-6 py-4 text-gray-600">
      {user.hire_date ? new Date(user.hire_date).toLocaleDateString() : 'N/A'}
    </td>

    {/* Estado */}
    <td className="px-6 py-4">
      <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(user.status)}`}>
        {user.status || 'Active'}
      </span>
    </td>

    {/* Acciones */}
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onEdit(user)}
          className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs transition-colors hover:underline"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(user.employee_id, user.first_name, user.last_name)}
          className="text-red-600 hover:text-red-900 font-semibold text-xs transition-colors hover:underline"
        >
          Eliminar
        </button>
      </div>
    </td>

  </tr>
);