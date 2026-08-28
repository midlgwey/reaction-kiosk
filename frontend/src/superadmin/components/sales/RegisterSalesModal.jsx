// frontend/src/admin/components/sales/RegisterSaleModal.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const SUPERVISOR_PIN = '197006';

export const RegisterSaleModal = ({
  isOpen,
  onClose,
  onSave,
  employees,
  editingSale,
  userRole,
  loading
}) => {
  const [pin, setPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [saleDate, setSaleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [chilesSold, setChilesSold] = useState('');
  const [notes, setNotes] = useState('');

  const isSupervisor = userRole === 'supervisor';
  const isEditing = !!editingSale;
  const showForm = !isSupervisor || pinVerified;

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setPinVerified(false);
      setPinError(false);
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
    if (pin === SUPERVISOR_PIN) {
      setPinVerified(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSubmit = () => {
    if (!employeeId || !saleDate || chilesSold === '') return;
    onSave({
      employee_id: Number(employeeId),
      sale_date: saleDate,
      chiles_sold: Number(chilesSold),
      notes: notes || undefined,
      ...(isEditing && { sale_id: editingSale.sale_id })
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e0e0e0] flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-[#07074D] text-lg">
            {isEditing ? 'Modificar Venta' : 'Registrar Venta Diaria'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        </div>

        <div className="p-6 space-y-4">

          {/* PIN para supervisor */}
          {isSupervisor && !pinVerified ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Ingresa el PIN de supervisor para continuar
              </p>
              <input
                type="password"   
                value={pin}
                onChange={e => setPin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerifyPin()}
                autoComplete="new-password"
                className={`w-full border rounded-md p-3 text-center text-lg tracking-widest font-bold focus:outline-none ${pinError ? 'border-red-400 focus:border-red-400' : 'border-[#e0e0e0] focus:border-[#6A64F1]'}`}
              />
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
          ) : (
            <>
              {/* Empleado */}
              <div>
                <label className="block text-xs font-bold text-[#07074D] uppercase mb-1">Colaborador</label>
                <select
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  disabled={isEditing}
                  className="w-full border border-[#e0e0e0] rounded-md p-2.5 text-sm text-[#6B7280] focus:border-[#6A64F1] focus:outline-none bg-white disabled:opacity-60"
                >
                  <option value="">Selecciona un colaborador</option>
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.first_name} {emp.last_name} — {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-xs font-bold text-[#07074D] uppercase mb-1">Fecha de Venta</label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={e => setSaleDate(e.target.value)}
                  className="w-full border border-[#e0e0e0] rounded-md p-2.5 text-sm text-[#6B7280] focus:border-[#6A64F1] focus:outline-none"
                />
              </div>

              {/* Chiles */}
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

        {/* Footer */}
        {showForm && (
          <div className="px-6 py-4 border-t border-[#e0e0e0] flex justify-end gap-3 bg-gray-50">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !employeeId || !saleDate || chilesSold === ''}
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