import React, { useMemo } from 'react';
import Select from 'react-select';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { useWaiterRadiography } from '../../../hooks/waiters/useWaiterRadiography';
import { useWaiterPerformanceFilters, dateOptions} from './useWaiterPerformanceFilters';
import QuestionBar from '../QuestionBar';
// Estilos base de react-day-picker
import 'react-day-picker/dist/style.css';

const ChartLoading = () => (
  <div className="h-full w-full min-h-[300px] flex flex-col items-center justify-center bg-white/40 rounded-3xl animate-pulse border-2 border-dashed border-slate-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">Cargando métricas...</span>
  </div>
);

const customSelectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    borderColor: '#e2e8f0',
    fontSize: '0.75rem',
    fontWeight: '600',
    minHeight: '38px',
    backgroundColor: '#f8fafc',
    '&:hover': { borderColor: '#6366f1' },
    boxShadow: 'none'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f5f3ff' : 'white',
    color: state.isSelected ? 'white' : '#475569',
    fontSize: '0.75rem',
    fontWeight: '500'
  })
};

export default function WaiterPerformance() {
  const {
    selectedOption, setSelectedOption,
    selectedDay, setSelectedDay,
    selectedWaiterId,
    selectedTable, setSelectedTable,
    isPickerOpen, setIsPickerOpen,
    pickerRef,
    targetDate,
    handleWaiterChange,
  } = useWaiterPerformanceFilters();

  const { 
    waiters, 
    radiography, 
    tables,
    loading, 
    loadingWaiters,
    loadingTables,
    error 
  } = useWaiterRadiography(selectedWaiterId, targetDate, selectedTable);

  const waiterOptions = useMemo(() => waiters.map(w => ({ value: w.id, label: w.mesero })), [waiters]);
  const currentWaiterValue = waiterOptions.find(opt => opt.value === selectedWaiterId) || null;

  // Opciones de mesas basadas en lo que devuelve el backend
  const tableOptions = useMemo(() => tables.map(t => ({ value: t, label: `Mesa ${t}` })), [tables]);
  const currentTableValue = selectedTable ? { value: selectedTable, label: `Mesa ${selectedTable}` } : null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 flex flex-col w-full">

      {/* Encabezado y Filtros */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">Radiografía por Mesero</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Análisis de satisfacción del cliente por colaborador</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative" ref={pickerRef}>
          
          {/* Select Mesero */}
          <div className="w-full sm:w-64">
            <Select
              options={waiterOptions}
              value={currentWaiterValue}
              isLoading={loadingWaiters}
              onChange={(opt) => handleWaiterChange(opt ? opt.value : '')} // ✅ usa handleWaiterChange
              styles={customSelectStyles}
              placeholder="Seleccionar Mesero..."
              isSearchable={true}
              isClearable={true}
            />
          </div>

          {/* Select Mesa — solo visible si hay mesero seleccionado */}
          {selectedWaiterId && (
            <div className="w-full sm:w-44">
              <Select
                options={tableOptions}
                value={currentTableValue}
                isLoading={loadingTables}
                isDisabled={tables.length === 0}
                onChange={(opt) => setSelectedTable(opt ? opt.value : null)}
                styles={customSelectStyles}
                placeholder={tables.length === 0 ? "Sin mesas" : "Todas las mesas"}
                isClearable={true}
              />
            </div>
          )}

          {/* Select Fecha */}
          <div className="w-full sm:w-48">
            <Select
              options={dateOptions}
              value={selectedOption}
              onChange={(opt) => {
                setSelectedOption(opt);
                if (opt.value === 'custom') setIsPickerOpen(true);
                else setIsPickerOpen(false);
              }}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>

          {/* Calendario flotante */}
          {selectedOption.value === 'custom' && isPickerOpen && (
            <div className="absolute right-0 top-12 z-[100] bg-white shadow-2xl border border-slate-200 rounded-2xl p-2 animate-in fade-in zoom-in duration-200">
              <DayPicker
                mode="single"
                selected={selectedDay}
                onSelect={(day) => {
                  if (day) {
                    setSelectedDay(day);
                    setIsPickerOpen(false);
                  }
                }}
                locale={es}
                disabled={{ after: new Date() }}
                modifiersClassNames={{
                  selected: 'bg-indigo-600 text-white rounded-lg',
                  today: 'text-indigo-600 font-bold'
                }}
              />
            </div>
          )}

          {/* Indicador fecha personalizada */}
          {selectedOption.value === 'custom' && !isPickerOpen && (
            <button
              onClick={() => setIsPickerOpen(true)}
              className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors uppercase"
            >
              {format(selectedDay, "dd 'de' MMMM", { locale: es })}
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="min-h-[300px]">
        {!selectedWaiterId ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <span className="text-3xl">🍽️</span>
              <p className="italic text-sm">Seleccione a un mesero para visualizar sus métricas</p>
            </div>
          </div>
        ) : loading ? (
          <ChartLoading />
        ) : error ? (
          <div className="py-20 text-center text-rose-400 font-bold text-xs uppercase tracking-widest">{error}</div>
        ) : radiography.length > 0 ? (
          <div className="space-y-8">
            {/* ✅ Indica si estás viendo una mesa específica */}
            {selectedTable && (
              <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">
                Mostrando resultados de Mesa {selectedTable}
              </p>
            )}
            {radiography.map((q) => (
              <QuestionBar key={q.id} question={q} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-300 italic text-xs uppercase tracking-widest">
            No se encontraron registros en la fecha seleccionada
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-10 pt-6 border-t border-slate-50 flex flex-wrap gap-6 justify-center">
        <LegendItem color="bg-emerald-400" label="Excelente" />
        <LegendItem color="bg-indigo-400" label="Bueno" />
        <LegendItem color="bg-amber-400" label="Regular" />
        <LegendItem color="bg-rose-400" label="Malo" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`}></span>
      <span className="text-xs font-semibold text-slate-600">{label}</span>
    </div>
  );
}