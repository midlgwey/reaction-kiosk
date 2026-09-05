// frontend/src/admin/hooks/attendance/useAttendanceTable.js
import { useMemo, useState } from 'react';
import { positionHierarchy } from '../../utils/attendanceUtils';

export const useAttendanceTable = (attendance) => {
  const [selectedArea, setSelectedArea]         = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  const hasActiveFilters = selectedArea || selectedPosition;

  const handleClearFilters = () => {
    setSelectedArea('');
    setSelectedPosition('');
  };

  // Filtrado y ordenamiento de la lista de asistencia
  const filteredAndSortedAttendance = useMemo(() => {
    if (!attendance) return [];

    const filtered = attendance.filter((record) =>
      (!selectedArea    || record.work_area === selectedArea) &&
      (!selectedPosition || record.position === selectedPosition)
    );

    // Ordenar por jerarquía de puestos y luego alfabéticamente
    return filtered.sort((a, b) => {
      const orderA = positionHierarchy[a.position] || 99;
      const orderB = positionHierarchy[b.position] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return (a.first_name || '').localeCompare(b.first_name || '');
    });
  }, [attendance, selectedArea, selectedPosition]);

  return {
    selectedArea,     setSelectedArea,
    selectedPosition, setSelectedPosition,
    hasActiveFilters, handleClearFilters,
    filteredAndSortedAttendance,
  };
};