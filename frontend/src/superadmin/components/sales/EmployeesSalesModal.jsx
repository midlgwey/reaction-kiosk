// frontend/src/superadmin/components/sales/EmployeeSalesModal.jsx
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const EmployeeSalesModal = ({
  isOpen,
  onClose,
  employee,
  sales,
  onEditSale,
  userRole,
  canEditWithoutPin,
  onRequestModificacionPin
}) => {
  const [showPinInput, setShowPinInput] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  if (!isOpen || !employee) return null;

  const totalMonth = sales.reduce((sum, s) => sum + Number(s.chiles_sold), 0);

  const handleEditClick = (sale) => {
    if (userRole === 'admin' || canEditWithoutPin(sale.sale_date)) {
      onEditSale(sale);
      return;
    }

    setShowPinInput(sale.sale_id);
    setPinInput('');
    setPinError(false);
    setShowPin(false);
  };

  const handleVerifyModificacionPin = () => {
    const isValid = onRequestModificacionPin(pinInput);
    if (isValid) {
      const sale = sales.find(s => s.sale_id === showPinInput);
      if (sale) {
        onEditSale(sale);
        setShowPinInput(null);
        setPinInput('');
      }
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e0e0e0] flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 text-[#6A64F1] flex items-center justify-center font-bold">
              {employee.first_name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-[#07074D]">{employee.first_name} {employee.last_name}</h3>
              <p className="text-xs text-gray-500">{employee.position}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        </div>

        {/* Selector de mes + resumen */}
        <div className="px-6 py-3 border-b border-[#e0e0e0] bg-indigo-50 flex items-center justify-between">
          <span className="text-sm font-bold text-[#07074D]">
            Total: {totalMonth} chiles
          </span>
        </div>

        {/* PIN Modal */}
        {showPinInput !== null ? (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Este registro es anterior a los últimos 2 días hábiles.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Ingresa el PIN de supervisor para modificar.
              </p>
            </div>
            
            {/* Contenedor relativo para input y ojito */}
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                name="no-autofill-pin"
                placeholder=""
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerifyModificacionPin()}
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className={`w-full border rounded-md p-3 pr-12 text-center text-lg tracking-widest font-bold focus:outline-none ${
                  pinError ? 'border-red-400 focus:border-red-400' : 'border-[#e0e0e0] focus:border-[#6A64F1]'
                }`}
              /> {/* <--- ¡Aquí faltaba cerrar el input con /> ! */}
              
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                {showPin ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {pinError && (
              <p className="text-xs text-red-500 text-center">PIN incorrecto. Intenta de nuevo.</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPinInput(null)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleVerifyModificacionPin}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#6A64F1] hover:bg-[#5b55e0]"
              >
                Verificar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Lista de ventas */}
            <div className="overflow-y-auto max-h-[380px] divide-y divide-[#e0e0e0]">
              {sales.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">
                  No hay ventas registradas este mes.
                </div>
              ) : (
                sales.map(sale => {
                  const canEdit = userRole === 'admin' || canEditWithoutPin(sale.sale_date);

                  return (
                    <div key={sale.sale_id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#07074D]">
                          {format(parseISO(sale.sale_date), "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                        {!canEdit && (
                          <p className="text-xs text-orange-600 font-medium mt-0.5">
                            Requiere PIN para editar
                          </p>
                        )}
                        {sale.notes && (
                          <p className="text-xs text-gray-400 mt-0.5">{sale.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-[#07074D]">
                          {sale.chiles_sold}
                        </span>
                        <button
                          onClick={() => handleEditClick(sale)}
                          className={`text-xs font-semibold hover:underline ${
                            canEdit ? 'text-[#6A64F1]' : 'text-orange-600'
                          }`}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#e0e0e0] bg-gray-50 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100">
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};