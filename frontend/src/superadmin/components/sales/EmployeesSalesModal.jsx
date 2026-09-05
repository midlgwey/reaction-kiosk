// frontend/src/superadmin/components/sales/EmployeeSalesModal.jsx
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import './EmployeeSalesModal.css'; 

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
    if (userRole === 'admin') {
      onEditSale(sale);
      return;
    }

    if (canEditWithoutPin(sale.sale_date)) {
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

        {/* Resumen */}
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
                Ingresa el PIN de | Modificación | para poder editar.
              </p>
            </div>
            
            <div className="relative" autoComplete="off">
              <input
                type={showPin ? 'text' : 'password'}
                name="kioskly-modificacion-turno"
                id="kioskly-modificacion-turno"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                aria-label="Código de modificación de turno"
                placeholder=""
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerifyModificacionPin()}
                className={`pin-input w-full border rounded-md p-3 pr-12 text-center text-lg tracking-widest font-bold focus:outline-none ${
                  pinError ? 'border-red-400 focus:border-red-400' : 'border-[#e0e0e0] focus:border-[#6A64F1]'
                }`}
              />
              
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                
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