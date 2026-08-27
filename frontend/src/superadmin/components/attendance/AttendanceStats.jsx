import React from 'react';

export default function AttendanceStats({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
      <div className="bg-white p-4 rounded-xl border border-[#e0e0e0] shadow-sm border-l-4 border-l-green-500">
        <p className="text-sm text-[#6B7280] font-medium">Presentes</p>
        <p className="text-2xl font-bold text-[#07074D]">{stats.presentes}</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-[#e0e0e0] shadow-sm border-l-4 border-l-orange-500">
        <p className="text-sm text-[#6B7280] font-medium">Retardos</p>
        <p className="text-2xl font-bold text-[#07074D]">{stats.retardos}</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-[#e0e0e0] shadow-sm border-l-4 border-l-red-500">
        <p className="text-sm text-[#6B7280] font-medium">Faltas</p>
        <p className="text-2xl font-bold text-[#07074D]">{stats.faltas}</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-[#e0e0e0] shadow-sm border-l-4 border-l-blue-500">
        <p className="text-sm text-[#6B7280] font-medium">Incapacidades</p>
        <p className="text-2xl font-bold text-[#07074D]">{stats.incapacidades}</p>
      </div>
    </div>
  );
}