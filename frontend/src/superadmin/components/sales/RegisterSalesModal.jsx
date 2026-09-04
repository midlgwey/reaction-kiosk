// frontend/src/admin/components/sales/RegisterSaleModal.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

export const RegisterSaleModal = ({
  isOpen,
  onClose,
  onSave,
  employees,
  editingSale,
  userRole,
  loading,
  registroPinVerified,
  registroPinExpireTime,
  onVerifyPin,
  pinError
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [saleDate, setSaleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [chilesSold, setChilesSold] = useState('');
  const [notes, setNotes] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  const isSupervisor = userRole === 'supervisor';
  const isEditing = !!editingSale;
  const showForm = !isSupervisor || registroPinVerified || isEditing;

  // Timer: cuenta regresiva del PIN de registro
  useEffect(() => {
    if (!registroPinVerified || !registroPinExpireTime) {
      setTimeLeft('');
      return;
    }

    const tick = () => {
      const diff = registroPinExpireTime - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expirado');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [registroPinVerified, registroPinExpireTime]);

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setShowPin(false);
    }
    if (isOpen && editingSale) {
      setEmployeeId(editingSale.employee_id || '');
      setSaleDate(editingSale.sale_date || format(new Date(), 'yyyy-MM-dd'));
      setChilesSold(editingSale.chiles_sold || '');
      setNotes(editingSale.notes || '');
    } else if (isOpen) {
      setEmployeeId(editingSale?.employee_id ? String(editingSale.employee_id) : '');
      setSaleDate(format(new Date(), 'yyyy-MM-dd'));
      setChilesSold('');
      setNotes('');
    }
  }, [isOpen, editingSale]);

  if (!isOpen) return null;

  const handleVerifyPin = () => {
    onVerifyPin(pin);
  };

  const handleSubmit = () => {
    const today = format(new Date(), 'yyyy-MM-dd');

    if (saleDate > today) {
      toast.error('No puedes registrar ventas de fechas futuras');
      return;
    }

    if (!employeeId || !saleDate || chilesSold === '') return;
    onSave({
      employee_id: Number(employeeId),
      sale_date: saleDate,
      chiles_sold: Number(chilesSold),
      notes: notes || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden">

        <div className="px-6 py-4 border-b border-[#e0e0e0] flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-[#07074D] text-lg">
            {isEditing ? 'Modificar Venta' : 'Registrar Venta Diaria'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        </div>

        <div className="p-6 space-y-4">

          {/* Timer de sesión PIN — solo supervisor con PIN activo y no editando */}
          {isSupervisor && registroPinVerified && !isEditing && timeLeft && (
            <div className="flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
              </svg>
              <span className="text-xs font-semibold text-indigo-700">
                Sesión activa · expira en {timeLeft}
              </span>
            </div>
          )}

          {/* PIN para supervisor — solo si NO está verificado */}
          {isSupervisor && !registroPinVerified && !isEditing && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Ingresa el PIN de supervisor para registrar ventas
              </p>

              <div className="relative" autoComplete="off">
                <input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="kioskly-acceso-turno"
                  id="kioskly-acceso-turno"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  aria-label="Código de acceso de turno"
                  placeholder=""
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyPin()}
                  className={`w-full border rounded-md py-3 pl-10 pr-10 text-center text-lg tracking-widest font-bold focus:outline-none ${
                    pinError ? 'border-red-400 focus:border-red-400' : 'border-[#e0e0e0] focus:border-[#6A64F1]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                
                </button>
              </div>

              {pinError && (
                <p className="text-xs text-red-500 text-center">PIN incorrecto. Intenta de nuevo.</p>
              )}
              <button
                onClick={handleVerifyPin}
                className="w-full bg-[#6A64F1] text-white py-2.5 rounded-lg font-semibold hover:bg-[#5b55e0] transition-colors"
              >
                Verificar PIN
              </button>
            </div>
          )}

          {/* Formulario — solo si está verificado, es admin, o está editando */}
          {showForm && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#07074D] uppercase mb-1">Colaborador</label>
                <select
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  disabled={isEditing}
                  className="w-full border border-[#e0e0e0] rounded-md p-2.5 text-sm text-[#6B7280] focus:border-[#6A64F1] focus:outline-none bg-white disabled:opacity-60"
                >
                  <option value="">Selecciona un mesero</option>
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.first_name} {emp.last_name} — {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#07074D] uppercase mb-1">Fecha de Venta</label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={e => setSaleDate(e.target.value)}
                  className="w-full border border-[#e0e0e0] rounded-md p-2.5 text-sm text-[#6B7280] focus:border-[#6A64F1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#07074D] uppercase mb-1">Chiles Vendidos</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 12"
                  value={chilesSold}
                  onChange={e => setChilesSold(e.target.value)}
                  className="w-full border border-[#e0e0e0] rounded-md p-2.5 text-sm text-[#6B7280] focus:border-[#6A64F1] focus:outline-none"
                />
              </div>
            </>
          )}
        </div>

        {showForm && (
          <div className="px-6 py-4 border-t border-[#e0e0e0] flex justify-end gap-3 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !employeeId || !saleDate || chilesSold === '' || saleDate > format(new Date(), 'yyyy-MM-dd')}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#6A64F1] hover:bg-[#5b55e0] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Venta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};