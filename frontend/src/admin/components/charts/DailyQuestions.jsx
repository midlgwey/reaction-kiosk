import React, { useState, useMemo, useRef, useEffect } from 'react';
import Select from 'react-select';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { useDailyQuestions } from '../../hooks/dashboard/useDashboardWeekly';
import QuestionBar from './QuestionBar';

// Estilos base de react-day-picker
import 'react-day-picker/dist/style.css';

const ChartLoading = () => (
  <div className="h-full w-full min-h-[200px] flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando datos...</span>
  </div>
);

const formatLocalDate = (date) => {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
};

// Opciones para React Select
const dateOptions = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'ayer', label: 'Ayer' },
  { value: 'antier', label: 'Antier' },
  { value: 'custom', label: '📅 Elegir fecha...' },
];

export default function DailyQuestions() {
  const [selectedOption, setSelectedOption] = useState(dateOptions[0]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilters = useMemo(() => {
    const d = new Date();
    const option = selectedOption.value;

    if (option === 'hoy') return { startDate: formatLocalDate(d), endDate: formatLocalDate(d) };
    if (option === 'ayer') {
      d.setDate(d.getDate() - 1);
      return { startDate: formatLocalDate(d), endDate: formatLocalDate(d) };
    }
    if (option === 'antier') {
      d.setDate(d.getDate() - 2);
      return { startDate: formatLocalDate(d), endDate: formatLocalDate(d) };
    }
    if (option === 'custom' && selectedDay) {
      return { startDate: formatLocalDate(selectedDay), endDate: formatLocalDate(selectedDay) };
    }
    return { startDate: formatLocalDate(d), endDate: formatLocalDate(d) };
  }, [selectedOption, selectedDay]);

  const { data, loading, error } = useDailyQuestions(getFilters);

  // Estilos personalizados para React Select (Indigo)
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: '#e2e8f0',
      fontSize: '0.875rem',
      minHeight: '38px',
      '&:hover': { borderColor: '#6366f1' }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f5f3ff' : 'white',
      color: state.isSelected ? 'white' : '#475569',
      fontSize: '0.875rem',
    })
  };

  return (
     <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 flex flex-col w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">Radiografía por Pregunta</h3>
          <p className="text-xs text-slate-500 mt-1">Análisis detallado de las preguntas de la encuesta.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative" ref={pickerRef}>
          {/* React Select */}
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
              placeholder="Seleccionar periodo"
            />
          </div>

          {/* React Day Picker (Popover) */}
          {selectedOption.value === 'custom' && isPickerOpen && (
            <div className="absolute right-0 top-12 z-[100] bg-white shadow-2xl border border-slate-200 rounded-2xl p-2 animate-fade-in">
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

          {/* Badge de fecha seleccionada */}
          {selectedOption.value === 'custom' && !isPickerOpen && (
            <button 
              onClick={() => setIsPickerOpen(true)}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              {format(selectedDay, "dd 'de' MMMM", { locale: es })}
            </button>
          )}
        </div>
      </div>

      {/* Leyenda y Listado de Datos */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Excelente</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-400"></span> Bueno</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Puede Mejorar</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400"></span> Malo</div>
      </div>

      <div className="min-h-[150px]">
        {loading ? <ChartLoading /> : 
         error ? <div className="text-center py-10 text-red-400 font-semibold">Error al cargar datos</div> :
         (!data || data.length === 0) ? <div className="text-center py-10 text-slate-400">No hay encuestas en esta fecha</div> :
         <div className="space-y-6">
           {data.map((q) => <QuestionBar key={q.id} question={q} />)}
         </div>
        }
      </div>
    </div>
  );
}