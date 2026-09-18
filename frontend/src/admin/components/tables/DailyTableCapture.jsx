import React, { useState, useMemo } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Select from 'react-select';
import { useActiveWaitersAdmin } from '../../hooks/waiters/useActiveWaitersAdmin';
import { useDailyTableCapture } from '../../hooks/waiters/useDailyTableCapture';
import { usePeriodFilter } from '../../hooks/shared/usePeriodFilter';
import PeriodSelector from '../shared/PeriodSelector';
import DashboardFilter from '../shared/DashboardFilter';

const DATE_OPTIONS = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'custom', label: '📅 Historial...' },
];

const customSelectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    borderColor: '#e2e8f0',
    fontSize: '0.875rem',
    minHeight: '42px',
    boxShadow: 'none',
    '&:hover': { borderColor: '#6366f1' }
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f5f3ff' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    fontSize: '0.875rem',
    cursor: 'pointer',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9ca3af',
    fontSize: '0.875rem',
  })
};

// Modal de Edición
function EditModal({ entry, isOpen, onClose, onSave, loading }) {
  const [value, setValue] = useState(entry?.table_count || '');

  const handleSave = async () => {
    await onSave(entry.id, parseInt(value));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-indigo-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Editar Mesas</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-lg transition"
          >
            <XMarkIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="mb-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Fecha
            </label>
            <p className="text-slate-700 font-medium">
              {format(new Date(entry?.date + 'T12:00:00'), 'dd MMMM yyyy')}
            </p>
          </div>

          <div className="mb-6">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Número de Mesas
            </label>
            <input
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border border-indigo-300 rounded-lg px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg disabled:opacity-50 transition"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de Confirmación de Delete
function DeleteConfirmModal({ isOpen, onClose, onConfirm, loading, entryDate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-rose-50/50">
          <h3 className="font-bold text-slate-800">Eliminar Registro</h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-slate-600 mb-2">
            ¿Estás seguro de que deseas eliminar el registro de <strong>{entryDate}</strong>?
          </p>
          <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg disabled:opacity-50 transition"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DailyTableCapture() {
  const [selectedWaiterId, setSelectedWaiterId] = useState('');
  const [tableCount, setTableCount] = useState('');
  const [dateOption, setDateOption] = useState(DATE_OPTIONS[0]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  
  // Estados para Modales
  const [editModal, setEditModal] = useState({ isOpen: false, entry: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, entry: null });

  const { selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, yearOptions } = usePeriodFilter();
  const { waiters } = useActiveWaitersAdmin();
  const { history, loading, error, captureToday, updateEntry, deleteEntry, refetch } = useDailyTableCapture(selectedMonth.value, selectedYear);

  const selectedWaiter = waiters.find(w => w.id === selectedWaiterId);
  const waiterOptions = waiters.map(w => ({ value: w.id, label: w.name }));

  const captureDate = useMemo(() => {
    if (dateOption.value === 'custom' && selectedDay) return format(selectedDay, 'yyyy-MM-dd');
    return format(new Date(), 'yyyy-MM-dd');
  }, [dateOption, selectedDay]);

  const filteredHistory = selectedWaiterId
    ? history.filter(entry => entry.waiter_id === selectedWaiterId)
    : [];

  const handleSave = async () => {
    if (!selectedWaiterId || !tableCount) return;
    await captureToday(selectedWaiterId, parseInt(tableCount), captureDate);
    setTableCount('');
  };

  const handleEditConfirm = async (id, newValue) => {
    await updateEntry(id, newValue);
    setEditModal({ isOpen: false, entry: null });
  };

  const handleDeleteConfirm = async () => {
    await deleteEntry(deleteModal.entry.id);
    setDeleteModal({ isOpen: false, entry: null });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
            Captura de Mesas Reales
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Registra, visualiza y edita las mesas atendidas por mesero
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={refetch}
            className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors border border-slate-200"
            title="Actualizar"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <PeriodSelector
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            yearOptions={yearOptions}
          />
        </div>
      </div>

      {/* Selector de Mesero */}
      <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/20">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
          Mesero
        </label>
        <Select
          options={waiterOptions}
          value={waiterOptions.find(o => o.value === selectedWaiterId) || null}
          onChange={(opt) => {
            setSelectedWaiterId(opt ? opt.value : '');
            setEditModal({ isOpen: false, entry: null });
            setDeleteModal({ isOpen: false, entry: null });
          }}
          styles={customSelectStyles}
          placeholder="Selecciona un mesero"
          isSearchable={false}
          className="w-full sm:w-80"
        />
      </div>

      {!selectedWaiterId ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-slate-400 text-sm italic">Selecciona un mesero para continuar</p>
        </div>
      ) : (
        <>
          {/* Formulario de Captura */}
          <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end border-b border-slate-100 bg-gradient-to-r from-indigo-50/30 to-transparent">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                {selectedWaiter?.name?.charAt(0)}
              </div>
              <span className="font-bold text-slate-700 text-sm">{selectedWaiter?.name}</span>
            </div>

            <div className="w-full sm:w-auto">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Fecha
              </label>
              <DashboardFilter
                options={DATE_OPTIONS}
                selectedOption={dateOption}
                setSelectedOption={setDateOption}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
              />
            </div>

            <div className="w-full sm:w-36">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Mesas
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={tableCount}
                onChange={(e) => setTableCount(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!tableCount}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              ➕ Guardar
            </button>
          </div>

          {/* Tabla de Historial */}
          <div className="overflow-x-auto overflow-y-auto max-h-[200px] md:max-h-[300px] lg:max-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center min-h-[120px]">
                <div className="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-rose-400 text-sm font-semibold">{error}</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] uppercase tracking-widest text-indigo-600 font-black bg-indigo-50 border-b border-slate-200 sticky top-0">
                    <th className="px-5 py-3 whitespace-nowrap">Fecha</th>
                    <th className="px-5 py-3 text-center whitespace-nowrap">Mesas</th>
                    <th className="px-5 py-3 text-center whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-sm italic">
                        Sin capturas para {selectedWaiter?.name} este mes
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((entry) => (
                      <tr key={entry.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-5 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                          {format(new Date(entry.date + 'T12:00:00'), 'dd MMM yyyy')}
                        </td>

                        <td className="px-5 py-3 text-center">
                          <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-md border border-indigo-100">
                            {entry.table_count}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => setEditModal({ isOpen: true, entry })}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors"
                              title="Editar"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, entry })}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                              title="Eliminar"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Modales */}
      <EditModal
        entry={editModal.entry}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, entry: null })}
        onSave={handleEditConfirm}
        loading={loading}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, entry: null })}
        onConfirm={handleDeleteConfirm}
        loading={loading}
        entryDate={deleteModal.entry ? format(new Date(deleteModal.entry.date + 'T12:00:00'), 'dd MMM yyyy') : ''}
      />
    </div>
  );
}