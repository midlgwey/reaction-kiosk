// frontend/src/admin/components/sales/SetupSeasonModal.jsx
import React, { useState, useEffect } from 'react';

const CURRENT_YEAR = new Date().getFullYear();

const INITIAL_WAITER_GOALS = [
  // Se cargan dinámicamente desde el dashboard
];

export const SetupSeasonModal = ({ isOpen, onClose, onSave, loading }) => {
  const [seasonYear, setSeasonYear] = useState(CURRENT_YEAR);
  const [seasonStart, setSeasonStart] = useState(`${CURRENT_YEAR}-08-01`);
  const [seasonEnd, setSeasonEnd] = useState(`${CURRENT_YEAR}-10-31`);
  const [globalGoal, setGlobalGoal] = useState('');
  const [teamGoal, setTeamGoal] = useState('');
  const [waiterGoals, setWaiterGoals] = useState([]);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && !employeesLoaded) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const api = (await import("../../../admin/services/api")).default;
      const { data } = await api.get('/employees');
      const eligible = data.filter(e => e.position === 'Mesero' || e.position === 'Capitan');
      setWaiterGoals(eligible.map(e => ({
        employee_id: e.employee_id,
        name: `${e.first_name} ${e.last_name}`,
        position: e.position,
        base_2025: '',
        goal_amount: ''
      })));
      setEmployeesLoaded(true);
    } catch {
      console.error('Error cargando empleados');
    }
  };

  const handleWaiterChange = (employee_id, field, value) => {
    setWaiterGoals(prev => prev.map(wg => {
      if (wg.employee_id !== employee_id) return wg;
      const updated = { ...wg, [field]: value };
      // Auto-calcular goal_amount si cambia base_2025
      if (field === 'base_2025' && value) {
        updated.goal_amount = Math.ceil(Number(value) * 1.15);
      }
      return updated;
    }));
  };

  const handleSubmit = () => {
    if (!globalGoal || !teamGoal) return;
    onSave({
      season_year: Number(seasonYear),
      season_start: seasonStart,
      season_end: seasonEnd,
      global_goal: Number(globalGoal),
      team_goal: Number(teamGoal),
      waiter_goals: waiterGoals.map(wg => ({
        employee_id: wg.employee_id,
        base_2025: Number(wg.base_2025),
        goal_amount: Number(wg.goal_amount)
      })).filter(wg => wg.base_2025 > 0)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e0e0e0] flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-[#07074D] text-lg">⚙️ Configurar Temporada {seasonYear}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">

          {/* Fechas y metas globales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#07074D] uppercase mb-1">Inicio Temporada</label>
              <input type="date" value={seasonStart} onChange={e => setSeasonStart(e.target.value)}
                className="w-full border border-[#e0e0e0] rounded-md p-2.5 text-sm focus:border-[#6A64F1] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#07074D] uppercase mb-1">Fin Temporada</label>
              <input type="date" value={seasonEnd} onChange={e => setSeasonEnd(e.target.value)}
                className="w-full border border-[#e0e0e0] rounded-md p-2.5 text-sm focus:border-[#6A64F1] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#07074D] uppercase mb-1">Meta Global (chiles)</label>
              <input type="number" min="0" placeholder="Ej: 4945" value={globalGoal} onChange={e => setGlobalGoal(e.target.value)}
                className="w-full border border-[#e0e0e0] rounded-md p-2.5 text-sm focus:border-[#6A64F1] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#07074D] uppercase mb-1">Meta Equipo Meseros (chiles)</label>
              <input type="number" min="0" placeholder="Ej: 3882" value={teamGoal} onChange={e => setTeamGoal(e.target.value)}
                className="w-full border border-[#e0e0e0] rounded-md p-2.5 text-sm focus:border-[#6A64F1] focus:outline-none" />
            </div>
          </div>

          {/* Metas individuales */}
          <div>
            <h4 className="text-sm font-bold text-[#07074D] uppercase tracking-wider mb-3">
              Metas Individuales — Base 2025 y Meta 2026
            </h4>
            <div className="space-y-2">
              {waiterGoals.map(wg => (
                <div key={wg.employee_id} className="grid grid-cols-3 gap-3 items-center bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-[#07074D]">{wg.name}</p>
                    <p className="text-xs text-gray-400">{wg.position}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Vendió 2025</label>
                    <input
                      type="number" min="0"
                      placeholder="Ej: 193"
                      value={wg.base_2025}
                      onChange={e => handleWaiterChange(wg.employee_id, 'base_2025', e.target.value)}
                      className="w-full border border-[#e0e0e0] rounded-md p-2 text-sm focus:border-[#6A64F1] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Meta 2026 (+15%)</label>
                    <input
                      type="number" min="0"
                      placeholder="Auto"
                      value={wg.goal_amount}
                      onChange={e => handleWaiterChange(wg.employee_id, 'goal_amount', e.target.value)}
                      className="w-full border border-[#e0e0e0] rounded-md p-2 text-sm focus:border-[#6A64F1] focus:outline-none bg-indigo-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e0e0e0] flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !globalGoal || !teamGoal}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#6A64F1] hover:bg-[#5b55e0] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar Temporada'}
          </button>
        </div>
      </div>
    </div>
  );
};