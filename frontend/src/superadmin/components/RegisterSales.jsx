import React, { useState, useEffect } from 'react';

export default function RegisterChileModal({ isOpen, onClose, onSave, record, mode }) {
  const initialState = {
    waiterName: '',
    shift: 'Matutino',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (mode === 'edit' && record) {
      setFormData({
        waiterName: record.waiterName || '',
        shift: record.shift || 'Matutino',
        quantity: record.quantity || '',
        date: record.date || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        ...initialState,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [mode, record, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-md p-6 transition-all">
      <div className="relative mx-auto w-full max-w-[700px] rounded-xl bg-white p-8 shadow-2xl sm:p-10 border border-gray-100">
        
        {/* Botón "X" para cerrar */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
          title="Cerrar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#07074D]">
            {mode === 'edit' ? 'Editar Venta de Chiles' : 'Captura Diaria: Chiles en Nogada'}
          </h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            {mode === 'edit' 
              ? 'Modifica los datos del registro de venta.' 
              : 'Ingresa las unidades vendidas por el mesero en el turno.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Mesero y Turno */}
          <div className="-mx-3 flex flex-wrap mb-5">
            <div className="w-full px-3 sm:w-1/2 mb-5 sm:mb-0">
              <label htmlFor="waiterName" className="mb-2 block text-base font-medium text-[#07074D]">
                Nombre del Mesero <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="waiterName"
                id="waiterName"
                required
                value={formData.waiterName}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <label htmlFor="shift" className="mb-2 block text-base font-medium text-[#07074D]">
                Turno <span className="text-red-500">*</span>
              </label>
              <select
                name="shift"
                id="shift"
                value={formData.shift}
                onChange={handleChange}
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
              >
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
              </select>
            </div>
          </div>

          {/* Cantidad y Fecha */}
          <div className="-mx-3 flex flex-wrap mb-8">
            <div className="w-full px-3 sm:w-1/2 mb-5 sm:mb-0">
              <label htmlFor="quantity" className="mb-2 block text-base font-medium text-[#07074D]">
                Chiles Vendidos <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                min="1"
                required
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Ej. 15"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <label htmlFor="date" className="mb-2 block text-base font-medium text-[#07074D]">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>
          </div>

          {/* Botones de Cancelar y Guardar */}
          <div className="flex flex-col-reverse justify-end gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-md border border-[#e0e0e0] bg-white px-8 py-3 text-center text-base font-semibold text-[#07074D] outline-none transition-colors hover:bg-gray-50 focus:ring-4 focus:ring-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none transition-colors hover:bg-[#5a54e0] hover:shadow-lg focus:ring-4 focus:ring-[#6A64F1]/30"
            >
              {mode === 'edit' ? 'Guardar Cambios' : 'Registrar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}