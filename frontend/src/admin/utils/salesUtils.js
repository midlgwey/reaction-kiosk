// frontend/src/admin/utils/salesUtils.js

export const MONTH_OPTIONS = [
  { label: 'Agosto',     value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre',    value: '10' },
];

export const getCurrentMonth = () => {
  const m = new Date().getMonth() + 1;
  if (m < 8)  return '08';
  if (m > 10) return '10';
  return String(m).padStart(2, '0');
};

export const STATUS_CONFIG = {
  green:  { label: '● Al corriente',      className: 'bg-green-100 text-green-700 border-green-200' },
  orange: { label: '● Ligeramente atrás', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  blue:   { label: '● Atrasado',          className: 'bg-blue-100 text-blue-700 border-blue-200' },
  red:    { label: '● Atención urgente',  className: 'bg-red-100 text-red-700 border-red-200' },
};

export const BAR_COLOR = {
  green:  'bg-green-500',
  orange: 'bg-orange-400',
  blue:   'bg-blue-500',
  red:    'bg-red-500',
};