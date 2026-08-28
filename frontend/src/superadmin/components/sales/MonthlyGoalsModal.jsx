// frontend/src/admin/components/sales/MonthlyGoalsModal.jsx
import React, { useState, useEffect } from 'react';

const MONTH_NAMES = { '08': 'Agosto', '09': 'Septiembre', '10': 'Octubre' };
const INCREASE_PERCENT = 15;

export const MonthlyGoalsModal = ({
  isOpen,
  onClose,
  onSave,
  selectedMonth,
  monthOptions,
  existingGoals,
  season,
  loading
}) => {
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (isOpen) loadEmployees();
  }, [isOpen]);

  useEffect(() => {
    if (employees.length === 0) return;

    if (existingGoals && existingGoals.length > 0) {
      // Cargar metas existentes
      setGoals(existingGoals.map(g => ({
        employee_id: g.employee_id,
        name: `${g.first_name} ${g.last_name}`,
        position: g.position,
        base_prev_year: String(g.base_prev_year),
        goal_amount: String(g.goal_amount)
      })));
    } else {
      // Metas en blanco
      setGoals(employees.map(e => ({
        employee_id: e.employee_id,
        name: `${e.first_name} ${e.last_name}`,
        position: e.position,
        base_prev_year: '',
        goal_amount: ''
      })));
    }
  }, [existingGoals, employees]);

  const loadEmployees = async () => {
    try {
      const api = (await import("../../../admin/services/api")).default;
      const { data } = await api.get('/employees');
      const eligible = data.filter(e =>
        e.position === 'Mesero' || e.position === 'Capitan'
      );
      // Ordenar: Capitan primero, luego Mesero
      eligible.sort((a, b) => {
        if (a.position === b.position) return a.first_name.localeCompare(b.first_name);
        return a.position === 'Capitan' ? -1 : 1;
      });
      setEmployees(eligible);
    } catch {
      console.error('Error cargando empleados');
    }
  };

  const handleChange = (employee_id, field, value) => {
    setGoals(prev => prev.map(g => {
      if (g.employee_id !== employee_id) return g;
      const updated = { ...g, [field]: value };
      // Auto-calcular goal_amount al cambiar base
      if (field === 'base_prev_year' && value) {
        updated.goal_amount = Math.ceil(Number(value) * (1 + INCREASE_PERCENT / 100));
      }
      return updated;
    }));
  };

  const handleSubmit = () => {
    const validGoals = goals.filter(g => g.base_prev_year && g.goal_amount);
    if (validGoals.length === 0) return;
    onSave({
      month: selectedMonth,
      goals: validGoals.map(g => ({
        employee_id: g.employee_id,
        base_prev_year: Number(g.base_prev_year),
        goal_amount: Number(g.goal_amount)
      }))
    });
  };

  const totalGoal = goals.reduce((sum, g) => sum + (Number(g.goal_amount) || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e0e0e0] flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-[#07074D] text-lg">
              Metas de {MONTH_NAMES[selectedMonth]}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Base del año anterior + {INCREASE_PERCENT}% de incremento
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        </div>

        {/* Selector de mes */}
        <div className="px-6 py-3 border-b border-[#e0e0e0] bg-indigo-50 flex items-center gap-2">
          {monthOptions.map(m => (
            <span
              key={m.value}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                selectedMonth === m.value
                  ? 'bg-[#6A64F1] text-white'
                  : 'bg-white text-gray-400 border border-[#e0e0e0]'
              }`}
            >
              {m.label}
            </span>
          ))}
          <span className="ml-auto text-xs text-gray-500 font-medium">
            Total equipo: <span className="font-bold text-[#07074D]">{totalGoal} chiles</span>
          </span>
        </div>

        {/* Lista de empleados */}
        <div className="overflow-y-auto max-h-[55vh] p-6 space-y-3">

          {/* Headers */}
          <div className="grid grid-cols-3 gap-3 px-3">
            <span className="text-xs font-bold text-gray-400 uppercase">Colaborador</span>
            <span className="text-xs font-bold text-gray-400 uppercase">Vendió año anterior</span>
            <span className="text-xs font-bold text-gray-400 uppercase">Meta +{INCREASE_PERCENT}%</span>
          </div>

          {goals.map(g => (
            <div key={g.employee_id} className="grid grid-cols-3 gap-3 items-center bg-gray-50 rounded-xl p-3">
              {/* Empleado */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-[#6A64F1] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {g.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#07074D] leading-tight">{g.name}</p>
                  <p className="text-xs text-gray-400">{g.position}</p>
                </div>
              </div>

              {/* Base año anterior */}
              <input
                type="number"
                min="0"
                placeholder="Ej: 193"
                value={g.base_prev_year}
                onChange={e => handleChange(g.employee_id, 'base_prev_year', e.target.value)}
                className="w-full border border-[#e0e0e0] rounded-lg p-2 text-sm text-center focus:border-[#6A64F1] focus:outline-none"
              />

              {/* Meta calculada */}
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="Auto"
                  value={g.goal_amount}
                  onChange={e => handleChange(g.employee_id, 'goal_amount', e.target.value)}
                  className="w-full border border-[#e0e0e0] rounded-lg p-2 text-sm text-center bg-indigo-50 focus:border-[#6A64F1] focus:outline-none font-semibold text-[#07074D]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e0e0e0] flex justify-between items-center bg-gray-50">
          <p className="text-xs text-gray-400">
            La meta se calcula automáticamente al ingresar la base
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || goals.every(g => !g.base_prev_year)}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#6A64F1] hover:bg-[#5b55e0] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar Metas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};