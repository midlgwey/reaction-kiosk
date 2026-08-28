// frontend/src/superadmin/components/ScheduleHeader.jsx
import React from 'react';
import { DocumentIcon } from '@heroicons/react/24/solid';
export const ScheduleHeader = ({ 
  startDate, 
  endDate, 
  onPrevWeek, 
  onNextWeek, 
  isPublished, 
  userRole, 
  onPublish, 
  onSaveDraft, 
  onOpenSwapModal,
  onExportExcel,
  loading 
}) => {
  return (
    <div className="mb-8 flex flex-col gap-4">
      
      {/* Fila 1 — Título y badge */}
      <div>
        <div className="flex items-center gap-3">
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight border-l-4 border-indigo-600 pl-4"> Horarios Semanales</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
            isPublished ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
          }`}>
            {isPublished ? 'Publicado y Bloqueado' : 'Borrador Editable'}
          </span>
        </div>
          <p className="text-sm mt-2 text-gray-500">
            Planificación y control de turnos del personal operativo.
          </p>
        
      </div>

      {/* Fila 2 — Navegador de semana + Botones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        
        {/* Barra de semana estilo Asistencia */}
        <div className="flex items-center gap-3 bg-indigo-50 border-l-4 border-[#6A64F1] rounded-lg px-4 py-3 shadow-sm w-fit">
          <button
            onClick={onPrevWeek}
            className="text-[#6A64F1] hover:text-[#5b55e0] font-bold text-lg transition-colors"
            title="Semana Anterior"
          >
            ←
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[#07074D] font-bold text-sm uppercase tracking-wide">
              {startDate} al {endDate}
            </span>
            <span className="text-[#6B7280] text-xs font-medium">
              Semana Operativa (Mar - Dom)
            </span>
          </div>
          <button
            onClick={onNextWeek}
            className="text-[#6A64F1] hover:text-[#5b55e0] font-bold text-lg transition-colors"
            title="Semana Siguiente"
          >
            →
          </button>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 flex-wrap">
          {userRole === 'admin' && (
            <button
              onClick={onExportExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-sm text-sm flex items-center gap-2"
            >
              <DocumentIcon className="w-4 h-4" />
              Exportar Excel
            </button>
          )}

          {userRole === 'admin' && !isPublished && (
            <>
              <button
                onClick={onSaveDraft}
                disabled={loading}
                className="bg-white border border-[#6A64F1] text-[#6A64F1] px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-sm text-sm disabled:opacity-50"
              >
                Guardar Borrador
              </button>
              <button
                onClick={onPublish}
                disabled={loading}
                className="bg-[#6A64F1] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#5b55e0] transition-colors shadow-sm text-sm disabled:opacity-50"
              >
                Publicar Horario
              </button>
            </>
          )}

          
        </div>
      </div>
    </div>
  );
};