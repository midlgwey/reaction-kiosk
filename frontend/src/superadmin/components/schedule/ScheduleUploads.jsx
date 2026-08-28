import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ITEMS_PER_PAGE = 5;

const getTypeBadge = (type) => {
  switch (type) {
    case 'Permiso':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Cambio de Turno':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Incapacidad':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const ScheduleUploads = ({ uploads = [], userRole, onOpenUploadModal }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(uploads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUploads = uploads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-lg">
      
      {/* Cabecera */}
      <div className="px-6 py-4 border-b border-[#e0e0e0] bg-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#07074D] uppercase tracking-wider">
            Documentos Registrados
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Permisos, cambios de turno e incapacidades
          </p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 bg-[#6A64F1] hover:bg-[#5b55e0] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            + Subir Documento
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left leading-normal">
          <thead>
            <tr className="border-b border-[#e0e0e0]">
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#07074D]">
                Archivo
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#07074D]">
                Tipo
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#07074D]">
                Fecha de subida
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#07074D] text-center">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {uploads.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-400 text-sm">
                  No hay documentos registrados para esta semana.
                </td>
              </tr>
            ) : (
              currentUploads.map((doc) => (
                <tr key={doc.upload_id} className="border-b border-[#e0e0e0] hover:bg-gray-50 transition">
                  
                  {/* Nombre del archivo */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {doc.file_name.endsWith('.pdf') ? '📄' : '🖼️'}
                      </span>
                      <span className="text-sm font-medium text-[#07074D] truncate max-w-[200px]">
                        {doc.file_name}
                      </span>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getTypeBadge(doc.upload_type)}`}>
                      {doc.upload_type}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {doc.uploaded_at
                      ? format(parseISO(doc.uploaded_at), "d 'de' MMMM yyyy", { locale: es })
                      : '—'
                    }
                  </td>

                  {/* Acción */}
                  <td className="px-6 py-4 text-center">
                    <a
                      href={`http://localhost:3000/${doc.file_path.replace(/\\/g, '/')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#6A64F1] hover:text-[#5b55e0] hover:underline transition"
                    >

                      Ver archivo
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#e0e0e0] bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Mostrando {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, uploads.length)} de {uploads.length} documentos
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#e0e0e0] bg-white text-[#6B7280] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Anterior
            </button>
            <span className="text-xs font-semibold text-[#07074D]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#e0e0e0] bg-white text-[#6B7280] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};