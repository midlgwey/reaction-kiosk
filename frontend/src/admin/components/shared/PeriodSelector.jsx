import React from 'react';
import Select from 'react-select';
import { MESES } from '../../hooks/shared/usePeriodFilter';

const customSelectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    borderColor: '#e2e8f0',
    fontSize: '0.75rem',
    minHeight: '36px',
    boxShadow: 'none',
    '&:hover': { borderColor: '#6366f1' }
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f5f3ff' : 'white',
    color: state.isSelected ? 'white' : '#475569',
    fontSize: '0.75rem',
  })
};

export default function PeriodSelector({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, yearOptions }) {
  return (
    <div className="flex gap-2 items-center">
      <div className="w-36">
        <Select
          options={MESES}
          value={selectedMonth}
          onChange={setSelectedMonth}
          styles={customSelectStyles}
          isSearchable={false}
        />
      </div>
      <div className="w-24">
        <Select
          options={yearOptions}
          value={{ value: selectedYear, label: `${selectedYear}` }}
          onChange={(opt) => setSelectedYear(opt.value)}
          styles={customSelectStyles}
          isSearchable={false}
        />
      </div>
    </div>
  );
}