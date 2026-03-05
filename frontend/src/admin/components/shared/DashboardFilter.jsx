import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';

const options = [
  { value: '1', label: 'Hoy' },
  { value: '7', label: '7 días' },
  { value: '15', label: '15 días' },
  { value: '30', label: '30 días' },
  { value: 'custom', label: '📅 Calendario' },
];

export default function DashboardFilter({ selectedOption, setSelectedOption, selectedDay, setSelectedDay }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative flex flex-col items-end gap-2" ref={containerRef}>
      <div className="w-36">
        <Select
          options={options}
          value={selectedOption}
          onChange={(opt) => {
            setSelectedOption(opt);
            if (opt.value === 'custom') setIsOpen(true);
            else setIsOpen(false);
          }}
          isSearchable={false}
          styles={{
            control: (b) => ({ ...b, borderRadius: '0.75rem', fontSize: '12px', minHeight: '32px' }),
            option: (b, s) => ({ ...b, fontSize: '12px', backgroundColor: s.isSelected ? '#6366f1' : b.backgroundColor })
          }}
        />
      </div>

      {selectedOption.value === 'custom' && (
        <>
          {isOpen && (
            <div className="absolute right-0 top-10 z-[100] bg-white shadow-2xl border rounded-2xl p-2 scale-90 origin-top-right">
              <DayPicker
                mode="single"
                selected={selectedDay}
                onSelect={(d) => { if(d) { setSelectedDay(d); setIsOpen(false); } }}
                locale={es}
                disabled={{ after: new Date() }}
              />
            </div>
          )}
          {!isOpen && (
            <button onClick={() => setIsOpen(true)} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
              {format(selectedDay, "dd MMM yyyy", { locale: es })}
            </button>
          )}
        </>
      )}
    </div>
  );
}