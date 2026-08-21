import React, { useState } from 'react';
import RegisterChileModal from './RegisterSales';

const INITIAL_SALES_DATA = [
  {
    id: 1,
    waiterName: 'Vera Carpenter',
    monthlyGoal: 200,
    soldThisMonth: 165,
    weeklyAverage: 41,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
  },
  {
    id: 2,
    waiterName: 'Blake Bowman',
    monthlyGoal: 200,
    soldThisMonth: 190,
    weeklyAverage: 47,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
  },
  {
    id: 3,
    waiterName: 'Dana Moore',
    monthlyGoal: 180,
    soldThisMonth: 110,
    weeklyAverage: 27,
    avatar: 'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
  },
  {
    id: 4,
    waiterName: 'Alonzo Cox',
    monthlyGoal: 200,
    soldThisMonth: 215,
    weeklyAverage: 53,
    avatar: 'https://images.unsplash.com/photo-1522609925277-66fea332c575?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80',
  },
];

export default function ChileSalesTable() {
  const [salesData, setSalesData] = useState(INITIAL_SALES_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('Agosto');

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filtrado de meseros
  const filteredWaiters = salesData.filter((item) =>
    item.waiterName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setModalMode('edit');
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleSaveSale = (formData) => {
    const qty = parseInt(formData.quantity) || 0;
    if (modalMode === 'create') {
      // Buscar si ya existe el mesero para actualizar o agregar simulación
      setSalesData((prev) =>
        prev.map((item) =>
          item.waiterName.toLowerCase() === formData.waiterName.toLowerCase()
            ? { ...item, soldThisMonth: item.soldThisMonth + qty }
            : item
        )
      );
    } else {
      setSalesData(
        salesData.map((item) =>
          item.id === selectedRecord.id
            ? { ...item, waiterName: formData.waiterName, soldThisMonth: qty }
            : item
        )
      );
    }
  };

  return (
    <div className="w-full font-sans antialiased">
      {/* Cabecera con Título y Botón de Registro */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Temporada Chiles en Nogada</h1>
          <p className="text-sm text-gray-500">Control de ventas, metas mensuales y promedios por mesero</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded-md bg-[#6A64F1] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#5b55e0] active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Registrar Venta Diaria
        </button>
      </div>

      {/* Controles de Búsqueda y Filtro de Mes */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-gray-400">
              <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar mesero..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 pl-12 pr-6 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md"
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full appearance-none rounded-md border border-[#e0e0e0] bg-white py-3 pl-6 pr-12 text-base font-medium text-[#6B7280] outline-none transition-all focus:border-[#6A64F1] focus:shadow-md sm:min-w-[180px]"
          >
            <option value="Agosto">Agosto (1 Ago - 31 Ago)</option>
            <option value="Septiembre">Septiembre (1 Sep - 30 Sep)</option>
            <option value="Octubre">Octubre (1 Oct - 31 Oct)</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left leading-normal">
            <thead>
              <tr className="bg-gray-50 border-b border-[#e0e0e0]">
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Mesero</th>
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Meta Mensual</th>
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Progreso Mensual</th>
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Promedio Semanal</th>
                <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#07074D]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredWaiters.map((item) => {
                const percentage = Math.min(Math.round((item.soldThisMonth / item.monthlyGoal) * 100), 100);
                return (
                  <tr key={item.id} className="border-b border-[#e0e0e0] transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-full w-full rounded-full object-cover shadow-sm" src={item.avatar} alt={item.waiterName} />
                        </div>
                        <p className="font-medium text-[#07074D]">{item.waiterName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#6B7280] font-semibold">{item.soldThisMonth} / {item.monthlyGoal} chiles</td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[160px]">
                        <div className="flex justify-between mb-1 text-xs font-semibold text-gray-600">
                          <span>{percentage}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${percentage >= 100 ? 'bg-green-500' : 'bg-[#6A64F1]'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#07074D]">{item.weeklyAverage} chiles/sem</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Integrado */}
      <RegisterChileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSale}
        record={selectedRecord}
        mode={modalMode}
      />
    </div>
  );
}