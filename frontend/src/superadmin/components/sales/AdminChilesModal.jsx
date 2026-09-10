// frontend/src/admin/components/sales/AdminChilesModal.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPepperHot } from '@fortawesome/free-solid-svg-icons';

export const AdminChilesModal = ({
  isOpen,
  onClose,
  onSave,
  loading,
  editingAdminSale
}) => {
  const [formData, setFormData] = useState({
    sale_date: '',
    chiles_sold: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingAdminSale) {
      setFormData({
        sale_date: editingAdminSale.sale_date || '',
        chiles_sold: editingAdminSale.chiles_sold || '',
        notes: editingAdminSale.notes || ''
      });
    } else {
      setFormData({
        sale_date: new Date().toISOString().split('T')[0],
        chiles_sold: '',
        notes: ''
      });
    }
    setErrors({});
  }, [isOpen, editingAdminSale]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sale_date) {
      newErrors.sale_date = 'La fecha es obligatoria';
    }

    if (!formData.chiles_sold || formData.chiles_sold === '') {
      newErrors.chiles_sold = 'La cantidad de chiles es obligatoria';
    } else if (Number(formData.chiles_sold) < 0) {
      newErrors.chiles_sold = 'No puede ser negativo';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      sale_date: formData.sale_date,
      chiles_sold: Number(formData.chiles_sold),
      notes: formData.notes || null
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800">
              {editingAdminSale ? 'Editar Registro' : 'Registrar Mis Chiles'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              name="sale_date"
              value={formData.sale_date}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 ${
                errors.sale_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.sale_date && (
              <p className="text-red-500 text-xs mt-1">{errors.sale_date}</p>
            )}
          </div>

          {/* Cantidad de chiles */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cantidad de Chiles *
            </label>
            <input
              type="number"
              name="chiles_sold"
              value={formData.chiles_sold}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej: 50"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 ${
                errors.chiles_sold ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.chiles_sold && (
              <p className="text-red-500 text-xs mt-1">{errors.chiles_sold}</p>
            )}
          </div>

          {/* Notas (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej: Pedidos para llevar"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {loading ? 'Guardando...' : editingAdminSale ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};