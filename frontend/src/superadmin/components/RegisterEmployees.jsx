// frontend/src/superadmin/components/RegisterEmployees.jsx
import React, { useState, useEffect } from 'react';

export default function RegisterEmployees({ isOpen, onClose, onSave, employee, mode, isSubmitting }) {
  const initialState = {
    first_name: '',
    last_name: '',
    phone_number: '',
    position: '',
    work_area: '',
    hire_date: '',
    status: 'Active',
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        phone_number: employee.phone_number || '',
        position: employee.position || '',
        work_area: employee.work_area || '',
        hire_date: employee.hire_date ? employee.hire_date.substring(0, 10) : '',
        status: employee.status || 'Active',
      });
    } else {
      setFormData(initialState);
    }
    setErrors({}); // Limpiar errores al abrir/cambiar modo
  }, [mode, employee, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar el error del campo cuando el usuario empiece a escribir o seleccionar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  // Auto-formato para el número de teléfono (10 dígitos)
  const handlePhoneChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    const truncated = onlyNumbers.slice(0, 10);
    
    let formattedNumber = truncated;
    if (truncated.length > 3) {
      formattedNumber = `${truncated.slice(0, 3)} ${truncated.slice(3)}`;
    }
    
    setFormData((prev) => ({
      ...prev,
      phone_number: formattedNumber
    }));

    if (errors.phone_number) {
      setErrors((prev) => ({ ...prev, phone_number: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos obligatorios
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = true;
    if (!formData.last_name.trim()) newErrors.last_name = true;
    if (!formData.phone_number.trim()) newErrors.phone_number = true;
    if (!formData.work_area) newErrors.work_area = true;
    if (!formData.position) newErrors.position = true;
    if (!formData.hire_date) newErrors.hire_date = true;
    if (!formData.status) newErrors.status = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Detiene el envío si hay campos vacíos
    }

    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  // Función auxiliar para obtener las clases dinámicas del borde
  const getInputClass = (fieldName) => {
    return `w-full rounded-md border ${
      errors[fieldName]
        ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500'
        : 'border-[#e0e0e0] focus:border-[#6A64F1]'
    } bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:shadow-md`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-6 transition-all">
      <div className="relative mx-auto w-full max-w-[700px] rounded-xl bg-white p-8 shadow-2xl sm:p-10 border border-gray-100">
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
              <label htmlFor="first_name" className="mb-2 block text-base font-medium text-[#07074D]">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ej. Juan"
                className={getInputClass('first_name')}
              />
              {errors.first_name && <p className="mt-1 text-xs text-red-500">El nombre es obligatorio.</p>}
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <label htmlFor="last_name" className="mb-2 block text-base font-medium text-[#07074D]">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Ej. Pérez"
                className={getInputClass('last_name')}
              />
              {errors.last_name && <p className="mt-1 text-xs text-red-500">El apellido es obligatorio.</p>}
            </div>
          </div>

          {/* Teléfono y Área de Trabajo */}
          <div className="-mx-3 flex flex-wrap mb-5">
            <div className="w-full px-3 sm:w-1/2 mb-5 sm:mb-0">
              <label htmlFor="phone_number" className="mb-2 block text-base font-medium text-[#07074D]">
                Número de teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone_number"
                id="phone_number"
                value={formData.phone_number}
                onChange={handlePhoneChange}
                maxLength={11}
                placeholder="Ej. 664 1234-567"
                className={getInputClass('phone_number')}
              />
              {errors.phone_number && <p className="mt-1 text-xs text-red-500">El teléfono es obligatorio.</p>}
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <label htmlFor="work_area" className="mb-2 block text-base font-medium text-[#07074D]">
                Área de trabajo <span className="text-red-500">*</span>
              </label>
              <select
                name="work_area"
                id="work_area"
                value={formData.work_area}
                onChange={handleChange}
                className={getInputClass('work_area')}
              >
                <option value="">Selecciona un área</option>
                <option value="Comedor">Comedor</option>
                <option value="Barra">Barra</option>
                <option value="Caja">Caja</option>
              </select>
              {errors.work_area && <p className="mt-1 text-xs text-red-500">Selecciona un área de trabajo.</p>}
            </div>
          </div>

          {/* Puesto de trabajo */}
          <div className="mb-5">
            <label htmlFor="position" className="mb-2 block text-base font-medium text-[#07074D]">
              Puesto de trabajo <span className="text-red-500">*</span>
            </label>
            <select
              name="position"
              id="position"
              value={formData.position}
              onChange={handleChange}
              className={getInputClass('position')}
            >
              <option value="">Selecciona un puesto</option>
              <option value="Ayudante de Mesero">Ayudante de Mesero</option>
              <option value="Mesero">Mesero</option>
              <option value="Capitan">Capitan</option>
              <option value="Bartender">Bartender</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Capturista">Capturista</option>
              <option value="Hostess">Hostess</option>
            </select>
            {errors.position && <p className="mt-1 text-xs text-red-500">Selecciona un puesto de trabajo.</p>}
          </div>

          {/* Fecha de ingreso y Estado */}
          <div className="-mx-3 flex flex-wrap mb-8">
            <div className="w-full px-3 sm:w-1/2 mb-5 sm:mb-0">
              <label htmlFor="hire_date" className="mb-2 block text-base font-medium text-[#07074D]">
                Fecha de ingreso <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="hire_date"
                id="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                className={`${getInputClass('hire_date')} cursor-pointer`}
              />
              {errors.hire_date && <p className="mt-1 text-xs text-red-500">Selecciona la fecha de ingreso.</p>}
            </div>
            <div className="w-full px-3 sm:w-1/2">
              <label htmlFor="status" className="mb-2 block text-base font-medium text-[#07074D]">
                Estado de empleado <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className={getInputClass('status')}
              >
                <option value="Active">Activo</option>
                <option value="Inactive">Inactivo</option>
                <option value="Suspended">Suspendido</option>
              </select>
              {errors.status && <p className="mt-1 text-xs text-red-500">Selecciona el estado.</p>}
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse justify-end gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-md border border-[#e0e0e0] bg-white px-8 py-3 text-center text-base font-semibold text-[#07074D] outline-none transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none transition-colors hover:bg-[#5a54e0] disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : mode === 'edit' ? 'Guardar Cambios' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}