import React from 'react';

export default function QuestionBar({ question }) {
  // Helper para calcular porcentajes internamente
  const getPercentage = (value, total) => total > 0 ? `${(value / total) * 100}%` : '0%';
  const total = question.totalRespuestas;

  return (
    <div className="flex flex-col gap-2">
      {/* Título y contador */}
      <div className="flex justify-between items-end">
        <span className="text-sm font-bold text-slate-700">{question.label}</span>
        <span className="text-xs text-violet-500 font-extrabold">{total} respuestas</span>
      </div>

      {/* Barra Apilada Visual */}
      <div className="h-6 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner border border-slate-200/60">
        
        {question.respuestas.excelente > 0 && (
          <div 
            className="bg-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-900 transition-all duration-500"
            style={{ width: getPercentage(question.respuestas.excelente, total) }}
            title={`${question.respuestas.excelente} Excelente`}
          >
            {question.respuestas.excelente > (total * 0.05) ? question.respuestas.excelente : ''}
          </div>
        )}

        {question.respuestas.bueno > 0 && (
          <div 
            className="bg-indigo-400 flex items-center justify-center text-[10px] font-bold text-indigo-900 transition-all duration-500"
            style={{ width: getPercentage(question.respuestas.bueno, total) }}
            title={`${question.respuestas.bueno} Bueno`}
          >
            {question.respuestas.bueno > (total * 0.05) ? question.respuestas.bueno : ''}
          </div>
        )}

        {question.respuestas.regular > 0 && (
          <div 
            className="bg-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-900 transition-all duration-500"
            style={{ width: getPercentage(question.respuestas.regular, total) }}
            title={`${question.respuestas.regular} Puede Mejorar`}
          >
            {question.respuestas.regular > (total * 0.05) ? question.respuestas.regular : ''}
          </div>
        )}

        {question.respuestas.malo > 0 && (
          <div 
            className="bg-rose-400 flex items-center justify-center text-[10px] font-bold text-rose-900 transition-all duration-500"
            style={{ width: getPercentage(question.respuestas.malo, total) }}
            title={`${question.respuestas.malo} Malo`}
          >
            {question.respuestas.malo > (total * 0.05) ? question.respuestas.malo : ''}
          </div>
        )}

      </div>
    </div>
  );
}