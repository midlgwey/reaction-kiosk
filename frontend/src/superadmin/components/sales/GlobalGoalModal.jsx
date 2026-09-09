import React, { useState, useEffect } from 'react';

export const GlobalGoalModal = ({
  isOpen,
  onClose,
  onSave,
  currentGoal,
  loading
}) => {
  const [newGoal, setNewGoal] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && currentGoal) {
      setNewGoal(String(currentGoal));
      setError('');
    }
  }, [isOpen, currentGoal]);

  const handleSave = async () => {
    setError('');

    // Validaciones
    if (!newGoal.trim()) {
      setError('La meta global es obligatoria');
      return;
    }

    const goalNumber = parseInt(newGoal, 10);
    if (isNaN(goalNumber) || goalNumber < 0) {
      setError('Debes ingresar un número positivo');
      return;
    }

    if (goalNumber === currentGoal) {
      setError('La nueva meta debe ser diferente a la actual');
      return;
    }

    try {
      await onSave({ new_global_goal: goalNumber });
      setNewGoal('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar la meta');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        
        {/* Encabezado */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Modificar Meta Global</h2>
          <p className="text-sm text-gray-500 mt-1">
            Meta actual: <span className="font-semibold text-indigo-600">{currentGoal?.toLocaleString()} chiles</span>
          </p>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nueva Meta Global (chiles)
          </label>
          <input
            type="number"
            value={newGoal}
            onChange={(e) => {
              setNewGoal(e.target.value);
              setError('');
            }}
            placeholder="Ej: 5000"
            disabled={loading}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
          />
          {error && (
            <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg font-semibold text-white bg-indigo-400 hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              'Guardar Cambio'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};