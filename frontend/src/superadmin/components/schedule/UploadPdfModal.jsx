// frontend/src/superadmin/components/schedule/UploadPdfModal.jsx
import React, { useState } from 'react';

export const UploadPdfModal = ({ isOpen, onClose, onUpload, loading }) => {
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState('Permiso');
  const [uploadedBy, setUploadedBy] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_type', uploadType);
    formData.append('uploaded_by', uploadedBy || 'Admin');

    onUpload(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e0e0e0] flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-[#07074D] text-lg">Subir Evidencia de Permiso / Cambio de Turno</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#07074D] uppercase mb-1">Tipo de Solicitud</label>
            <select 
              value={uploadType} 
              onChange={(e) => setUploadType(e.target.value)}
              className="w-full border border-[#e0e0e0] rounded-md p-2 text-sm text-[#6B7280] bg-white focus:border-[#6A64F1] focus:outline-none"
            >
              <option value="Permiso">Permiso</option>
              <option value="Cambio de Turno">Cambio de Turno</option>
              <option value="Incapacidad">Incapacidad / Justificante</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#07074D] uppercase mb-1">Archivo PDF o Imagen</label>
            <input 
              type="file" 
              accept="application/pdf, image/jpeg, image/png"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border border-[#e0e0e0] rounded-md p-2 text-xs text-[#6B7280] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-[#6A64F1]"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e0e0e0]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#6A64F1] hover:bg-[#5b55e0]">
              {loading ? 'Subiendo...' : 'Subir Archivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};