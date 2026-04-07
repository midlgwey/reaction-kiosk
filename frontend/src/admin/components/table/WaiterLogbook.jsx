import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import LogbookRow from './LogbookRow'; 
import DashboardFilter from '../shared/DashboardFilter';
import { useWaiterLogbook } from '../../../admin/hooks/waiters/useWaiterLogbook'; 

const ChartLoading = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200 p-10">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando métricas...</span>
  </div>
);


const dateOptions = [
  { value: 'hoy',     label: 'Hoy' },
  { value: 'ayer',    label: 'Ayer' },
  { value: 'antier', label: 'Antier' },
  { value: 'custom',  label: '📅 Eligir Fecha' },
];

export default function WaiterLogbook() {
  const [activeTab, setActiveTab] = useState('realizadas');
  const [selectedOption, setSelectedOption] = useState(dateOptions[0]);
  const [selectedDay, setSelectedDay] = useState(new Date());

  const selectedDate = useMemo(() => {
    const d = new Date();
    if (selectedOption.value === 'hoy') return format(d, 'yyyy-MM-dd');
    if (selectedOption.value === 'ayer') { d.setDate(d.getDate() - 1); return format(d, 'yyyy-MM-dd'); }
     if (selectedOption.value === 'antier') { d.setDate(d.getDate() - 2); return format(d, 'yyyy-MM-dd'); }
    if (selectedOption.value === 'custom' && selectedDay) return format(selectedDay, 'yyyy-MM-dd');
    return format(d, 'yyyy-MM-dd');
  }, [selectedOption, selectedDay]);

  const { data, loading, error } = useWaiterLogbook(selectedDate, activeTab);


  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col w-full overflow-hidden">
      
      {/* Cabecera */}
      <div className="p-4 md:p-6 border-b border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-indigo-100">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
            Bitacora de Encuestas Realizadas y No Realizadas 
          </h3>
          <p className="text-[10px] text-slate-500 font-medium"> Auditoria de encuestas del restaurante</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('realizadas')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  activeTab === 'realizadas' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                ✅ Realizadas
              </button>
              <button
                onClick={() => setActiveTab('rechazadas')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  activeTab === 'rechazadas' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                ❌ No Realizadas
              </button>
            </div>
          <DashboardFilter options={dateOptions} selectedOption={selectedOption} setSelectedOption={setSelectedOption} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
        </div>
      </div>

      {/* Tabla */}
       <div className="flex-1 p-2 min-h-[450px] flex flex-col overflow-x-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[350px]">
            <ChartLoading />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center min-h-[350px]">
            <p className="text-rose-500 font-medium italic text-center">{error}</p>
          </div>
        ) : (
          <div className="min-w-max lg:min-w-full">
            {/* Headers */}
           <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs text-rose-600 font-semibold uppercase tracking-wider border-b border-slate-300 lg:w-auto w-[600px] shrink-0">
              <div className="col-span-2 text-center">Hora</div>
              <div className="col-span-3">Mesero</div>
              <div className="col-span-2 text-center">Mesa</div>
              <div className="col-span-2 text-center">Turno</div>  {/* ✅ */}
              <div className="col-span-3 text-right">Estado</div>
            </div>

            {/* Listado */}
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[400px]">
              {data?.length > 0 ? (
                data.map((item, i) => <LogbookRow key={i} decline={item} />)
              ) : (
                <div className="flex items-center justify-center min-h-[300px]">
                  <p className="italic text-sm text-slate-400">Sin encuestas registradas en este periodo.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}