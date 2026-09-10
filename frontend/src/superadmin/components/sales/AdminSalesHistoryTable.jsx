// frontend/src/admin/components/sales/AdminSalesHistoryTable.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPepperHot } from '@fortawesome/free-solid-svg-icons';

export const AdminSalesHistoryTable = ({
  adminSales = [],
  onEdit,
  onDelete,
  loading
}) => {
  if (adminSales.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg p-8 text-center">
        <FontAwesomeIcon icon={faPepperHot} className="text-gray-300 text-4xl mb-3" />
        <p className="text-gray-500 text-lg">No hay registros de chiles en este mes</p>
      </div>
    );
  }

  const totalChiles = adminSales.reduce((sum, sale) => sum + Number(sale.chiles_sold), 0);

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-lg overflow-hidden">
      {/* Encabezado */}
      <div className=" border-[#e0e0e0] bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#07074D] uppercase tracking-wider gap-2">
            Mi Historial de Chiles
          </h3>
          <div className="bg-emerald-600 px-4 py-2 rounded-lg">
            <p className="text-white font-semibold text-sm">
              Total: <span className="text-xl">{totalChiles.toLocaleString()}</span> chiles
            </p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Cantidad</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Notas</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {adminSales.map((sale) => (
              <tr
                key={sale.admin_sale_id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                {/* Fecha */}
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(sale.sale_date).toLocaleDateString('es-MX', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </td>

                {/* Cantidad */}
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-emerald-500 px-3 py-1 rounded-full">
                    <span className="font-bold text-white text-sm">
                      {Number(sale.chiles_sold).toLocaleString()}
                    </span>
                  </div>
                </td>

                {/* Notas */}
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">
                    {sale.notes ? (
                      <span className="italic">{sale.notes}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </p>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(sale)}
                      disabled={loading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition text-sm font-medium"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(sale.admin_sale_id)}
                      disabled={loading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition text-sm font-medium"
                      title="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Registros: {adminSales.length} | Total acumulado: {totalChiles.toLocaleString()} chiles
        </p>
      </div>
    </div>
  );
};