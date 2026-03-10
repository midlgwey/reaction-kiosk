import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import TotalQuestionBar from "../components/charts/TotalQuestionsBar";
import StatGridQWeekly from "../components/metrics/StatGridWeekly";
import SatisfactionByShift from "../components/charts/SatisfactionByShift";
import WeeklyCompRadar from "../components/charts/WeeklyCompRadar";
import DashboardFilter from "../components/shared/DashboardFilter";

const STATS_OPTIONS = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '14', label: 'Últimas 2 semanas' },
  { value: '30', label: 'Último mes' },
  { value: 'custom', label: '📅 Elegir rango exacto' },
];

const StatsPage = () => {
  // Estado para el filtro global
  const [filterOption, setFilterOption] = useState(STATS_OPTIONS[0]);
  const [customDate, setCustomDate] = useState(new Date());

  // Calcula los parámetros que se mandarán a la base de datos
  const filterParams = useMemo(() => {
    if (filterOption.value === 'custom') {
      const dateStr = format(customDate, 'yyyy-MM-dd');
      return { startDate: dateStr, endDate: dateStr };
    }
    return { days: Number(filterOption.value) };
  }, [filterOption, customDate]);

  return (
    <div className="space-y-6 relative">
      
      {/* Filtro Global Flotante */}
      <div className="flex justify-end items-center mb-4 sticky top-0 z-50 pt-2">
         <DashboardFilter 
            options={STATS_OPTIONS} 
            selectedOption={filterOption} 
            setSelectedOption={setFilterOption} 
            selectedDay={customDate} 
            setSelectedDay={setCustomDate} 
          />
      </div>

      <section>
        <StatGridQWeekly config={filterParams} />
      </section>

      <div className="grid grid-cols-12 gap-6">
        
        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="text-slate-800 font-bold mb-4 uppercase text-sm tracking-wider">
            Equilibrio de Servicio
          </h3>
          <div className="flex-1 flex justify-center items-center">
            {/* Le pasamos los filtros a la gráfica */}
            <WeeklyCompRadar config={filterParams}/>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="text-slate-800 font-bold mb-4 uppercase text-sm tracking-wider">
            Satisfacción por Turno y Día
          </h3>
          <div className="flex-1 w-full min-h-75">
             {/* Le pasamos los filtros a la gráfica */}
             <SatisfactionByShift config={filterParams} />
          </div>
        </div>

      </div>

      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full">
        <h3 className="text-slate-800 font-bold mb-6 uppercase text-sm tracking-wider text-center">
          Distribución de Sentimiento por Pregunta
        </h3>
        <div className="max-w-5xl mx-auto">
          {/* Le pasamos los filtros a la gráfica */}
          <TotalQuestionBar config={filterParams}/>
        </div>
      </section>

    </div>
  )
}

export default StatsPage;