import { useState, useMemo, useRef, useEffect } from 'react';
import { format, subDays } from 'date-fns';

export const dateOptions = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'ayer', label: 'Ayer' },
  { value: 'antier', label: 'Antier' },
  { value: 'custom', label: '📅 Elegir fecha...' },
];

export const useWaiterPerformanceFilters = () => {
  const [selectedOption, setSelectedOption] = useState(dateOptions[0]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedWaiterId, setSelectedWaiterId] = useState('');
  const [selectedTable, setSelectedTable] = useState(null); // ✅
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const targetDate = useMemo(() => {
    const d = new Date();
    const option = selectedOption.value;
    if (option === 'hoy') return format(d, 'yyyy-MM-dd');
    if (option === 'ayer') return format(subDays(d, 1), 'yyyy-MM-dd');
    if (option === 'antier') return format(subDays(d, 2), 'yyyy-MM-dd');
    if (option === 'custom' && selectedDay) return format(selectedDay, 'yyyy-MM-dd');
    return format(d, 'yyyy-MM-dd');
  }, [selectedOption, selectedDay]);

  // Al cambiar mesero, limpia la mesa seleccionada
  const handleWaiterChange = (id) => {
    setSelectedWaiterId(id);
    setSelectedTable(null);
  };

  return {
    selectedOption, setSelectedOption,
    selectedDay, setSelectedDay,
    selectedWaiterId,
    selectedTable, setSelectedTable,
    isPickerOpen, setIsPickerOpen,
    pickerRef,
    targetDate,
    handleWaiterChange,
  };
};