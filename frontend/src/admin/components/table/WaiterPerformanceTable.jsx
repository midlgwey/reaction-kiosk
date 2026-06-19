import React, { useState } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

// Datos de ejemplo — reemplaza con tu lista real de meseros
const MOCK_WAITERS = [
  { id: '1', name: 'Rafael Panduro' },
  { id: '2', name: 'Brayan Quiroga' },
  { id: '3', name: 'Sergio Vera' },
  { id: '4', name: 'Luis Pérez' },
  { id: '5', name: 'Ricardo Ortega' },
  { id: '6', name: 'Ruben Vázquez' },
  { id: '7', name: 'Adrian López' },
  { id: '8', name: 'Alan Rodríguez' },
];

export default function DailyTableCapture() {
  const [selectedWaiterId, setSelectedWaiterId] = useState('');
  const [tableCount, setTableCount] = useState('');
  const [history, setHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const getWaiterName = (id) => MOCK_WAITERS.find(w => w.id === id)?.name || 'Desconocido';

  const handleSave = () => {
    if (!selectedWaiterId || !tableCount) return;

    const today = format(new Date(), 'yyyy-MM-dd');

    // Si ya existe captura para este mesero hoy, la actualiza en vez de duplicar
    const existing = history.find(h => h.waiterId === selectedWaiterId && h.date === today);

    if (existing) {
      setHistory(prev => prev.map(h =>
        h.id === existing.id ? { ...h, table_count: parseInt(tableCount) } : h
      ));
    } else {
      const newEntry = {
        id: crypto.randomUUID(),
        waiterId: selectedWaiterId,
        mesero: getWaiterName(selectedWaiterId),
        date: today,
        table_count: parseInt(tableCount),
      };
      setHistory(prev => [newEntry, ...prev]);
    }

    setSelectedWaiterId('');
    setTableCount('');
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditValue(entry.table_count);
  };

  const confirmEdit = (id) => {
    setHistory(prev => prev.map(h =>
      h.id === id ? { ...h, table_count: parseInt(editValue) } : h
    ));
    setEditingId(null);
  };

  const deleteEntry = (id) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
          Captura de Mesas Reales
        </h3>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">
          Registro diario por mesero — Hoy: {format(new Date(), "dd 'de' MMMM")}
        </p>
      </div>

      {/* Formulario de captura */}
      <div className="px-6 py-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end border-b border-slate-100 bg-indigo-50/20">

        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
            Mesero
          </label>
          <select
            value={selectedWaiterId}
            onChange={(e) => setSelectedWaiterId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          >
            <option value="">Selecciona un mesero</option>
            {MOCK_WAITERS.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-40">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
            Mesas de hoy
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
          disabled={!selectedWaiterId || !tableCount}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
        >
          Guardar
        </button>
      </div>

      {/* Historial */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] uppercase tracking-widest text-indigo-600 font-black bg-indigo-50 border-b border-slate-200">
              <th className="px-5 py-3 whitespace-nowrap">Fecha</th>
              <th className="px-5 py-3 whitespace-nowrap">Mesero</th>
              <th className="px-5 py-3 text-center whitespace-nowrap">Mesas</th>
              <th className="px-5 py-3 text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-sm italic">
                  Sin capturas registradas todavía
                </td>
              </tr>
            ) : (
              history.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">

                  <td className="px-5 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                    {format(new Date(entry.date), 'dd MMM')}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {entry.mesero?.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{entry.mesero}</span>
                    </div>
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
                          <button
                            onClick={() => confirmEdit(entry.id)}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="Confirmar"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                            title="Cancelar"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(entry)}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                            title="Eliminar"
                          >
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
      </div>

    </div>
  );
}