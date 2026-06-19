import { useState } from 'react';

export const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export const usePeriodFilter = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    MESES.find(m => m.value === (now.getMonth() + 1))
  );
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const yearOptions = [
    { value: now.getFullYear(), label: `${now.getFullYear()}` },
    { value: now.getFullYear() - 1, label: `${now.getFullYear() - 1}` },
  ];

  return { MESES, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, yearOptions };
};