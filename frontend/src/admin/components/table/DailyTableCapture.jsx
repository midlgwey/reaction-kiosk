import React, { useState, useMemo } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useActiveWaitersAdmin } from '../../hooks/waiters/useActiveWaitersAdmin';
import { useDailyTableCapture } from '../../hooks/waiters/useDailyTableCapture';
import { usePeriodFilter } from '../../hooks/shared/usePeriodFilter';
import PeriodSelector from '../shared/PeriodSelector';
import DashboardFilter from '../shared/DashboardFilter';

// Opciones del selector de fecha — hoy por defecto, historial para capturas atrasadas
const DATE_OPTIONS = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'custom', label: '📅 Historial...' },
];

export default function DailyTableCapture() {
  const [selectedWaiterId, setSelectedWaiterId] = useState('');
  const [tableCount, setTableCount] = useState('');
  const [dateOption, setDateOption] = useState(DATE_OPTIONS[0]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const { selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, yearOptions } = usePeriodFilter();
  const { waiters } = useActiveWaitersAdmin();
  const { history, loading, error, captureToday, updateEntry, deleteEntry, refetch } = useDailyTableCapture(selectedMonth.value, selectedYear);

  // Mesero actualmente seleccionado
  const selectedWaiter = waiters.find(w => w.id === selectedWaiterId);

  // Fecha de captura — hoy por defecto, o la fecha elegida en el historial
  const captureDate = useMemo(() => {
    if (dateOption.value === 'custom' && selectedDay) return format(selectedDay, 'yyyy-MM-dd');
    return format(new Date(), 'yyyy-MM-dd');
  }, [dateOption, selectedDay]);

  // Solo muestra registros del mesero seleccionado
  const filteredHistory = selectedWaiterId
    ? history.filter(entry => entry.waiter_id === selectedWaiterId)
    : [];

  const handleSave = async () => {
    if (!selectedWaiterId || !tableCount) return;
    await captureToday(selectedWaiterId, parseInt(tableCount), captureDate);
    setTableCount('');
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditValue(entry.table_count);
  };

  const confirmEdit = async (id) => {
    await updateEntry(id, parseInt(editValue));
    setEditingId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

      {/* Encabezado con selector de mes y botón de refresh */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
            Captura de Mesas Reales
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Selecciona un mesero para ver su historial y registrar sus mesas
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

      {/* Selector de mesero — al cambiar resetea el modo edición */}
      <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/20">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
          Mesero
        </label>
        <select
          value={selectedWaiterId}
          onChange={(e) => {
            setSelectedWaiterId(e.target.value);
            setEditingId(null);
          }}
          className="w-full sm:w-80 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
        >
          <option value="">Selecciona un mesero</option>
          {waiters.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Estado vacío cuando no hay mesero seleccionado */}
      {!selectedWaiterId ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-slate-400 text-sm italic">Selecciona un mesero para continuar</p>
        </div>
      ) : (
        <>
          {/* Formulario de captura */}
          <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end border-b border-slate-100">

            {/* Avatar y nombre del mesero seleccionado */}
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                {selectedWaiter?.name?.charAt(0)}
              </div>
              <span className="font-bold text-slate-700 text-sm">{selectedWaiter?.name}</span>
            </div>

            {/* Selector de fecha — hoy por defecto, historial para capturas atrasadas */}
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

            {/* Número de mesas */}
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
              Guardar
            </button>
          </div>

          {/* Historial de capturas del mesero en el mes seleccionado */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center min-h-[120px]">
                <div className="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-rose-400 text-sm font-semibold">{error}</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] uppercase tracking-widest text-indigo-600 font-black bg-indigo-50 border-b border-slate-200">
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
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors">

                        {/* +T12:00:00 evita el desfase de zona horaria */}
                        <td className="px-5 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                          {format(new Date(entry.date + 'T12:00:00'), 'dd MMM yyyy')}
                        </td>

                        <td className="px-5 py-3 text-center">
                          {editingId === entry.id ? (
                            <input
                              type="number"
                              min="0"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-16 text-center border border-indigo-300 rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              autoFocus
                            />
                          ) : (
                            <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-md border border-indigo-100">
                              {entry.table_count}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex justify-center items-center gap-1">
                            {editingId === entry.id ? (
                              <>
                                <button onClick={() => confirmEdit(entry.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Confirmar">
                                  <CheckIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="Cancelar">
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(entry)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors" title="Editar">
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteEntry(entry.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors" title="Eliminar">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
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

    </div>
  );
}