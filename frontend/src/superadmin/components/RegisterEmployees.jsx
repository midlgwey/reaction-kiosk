import React, { useState, useEffect } from 'react';

export default function RegisterEmployees({ isOpen, onClose, onSave, employee, mode }) {
  const initialState = {
    name: '',
    lastname: '',
    phone: '',
    email: '',
    position: '',
    area: '',
    startDate: '',
    status: 'Activo',
  };

  const [formData, setFormData] = useState(initialState);

  // Precarga los datos si estamos en modo edición
  useEffect(() => {
    if (mode === 'edit' && employee) {
      const nameParts = employee.name ? employee.name.split(' ') : ['', ''];
      setFormData({
        name: nameParts[0] || '',
        lastname: nameParts.slice(1).join(' ') || '',
        phone: employee.phone || '',
        email: employee.email || '',
        position: employee.role || '',
        area: employee.area || '',
        startDate: employee.createdAt || '',
        status: employee.status || 'Activo',
      });
    } else {
      setFormData(initialState);
    }
  }, [mode, employee, isOpen]);

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
            {mode === 'edit' ? 'Editar Empleado' : 'Registro de Empleado'}
          </h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            {mode === 'edit' 
              ? 'Modifica la información del colaborador.' 
              : 'Completa la información para dar de alta a un nuevo colaborador.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nombre y Apellido */}
          <div className="-mx-3 flex flex-wrap mb-5">
            <div className="w-full px-3 sm:w-1/2 mb-5 sm:mb-0">
              <label htmlFor="name" className="mb-2 block text-base font-medium text-[#07074D]">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Juan"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <label htmlFor="lastname" className="mb-2 block text-base font-medium text-[#07074D]">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastname"
                id="lastname"
                required
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Ej. Pérez"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>
          </div>

          {/* Teléfono y Correo */}
          <div className="-mx-3 flex flex-wrap mb-5">
            <div className="w-full px-3 sm:w-1/2 mb-5 sm:mb-0">
              <label htmlFor="phone" className="mb-2 block text-base font-medium text-[#07074D]">
                Número de teléfono
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ingresa su teléfono"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <label htmlFor="email" className="mb-2 block text-base font-medium text-[#07074D]">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>
          </div>

          {/* Puesto y Área */}
          <div className="-mx-3 flex flex-wrap mb-5">
            <div className="w-full px-3 sm:w-1/2 mb-5 sm:mb-0">
              <label htmlFor="position" className="mb-2 block text-base font-medium text-[#07074D]">
                Puesto de trabajo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="position"
                id="position"
                required
                value={formData.position}
                onChange={handleChange}
                placeholder="Ej. Mesero, Administrador"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <label htmlFor="area" className="mb-2 block text-base font-medium text-[#07074D]">
                Área de trabajo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="area"
                id="area"
                required
                value={formData.area}
                onChange={handleChange}
                placeholder="Ej. Servicio, Cocina"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>
          </div>

          {/* Fecha de ingreso y Estado */}
          <div className="-mx-3 flex flex-wrap mb-8">
            <div className="w-full px-3 sm:w-1/2 mb-5 sm:mb-0">
              <label htmlFor="startDate" className="mb-2 block text-base font-medium text-[#07074D]">
                Fecha de ingreso <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md cursor-pointer"
                />
              </div>
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <label htmlFor="status" className="mb-2 block text-base font-medium text-[#07074D]">
                Estado de empleado
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
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
              {mode === 'edit' ? 'Guardar Cambios' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}