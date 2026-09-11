//frontend/src/admin/components/ui/ChartLoading.jsx

import React from 'react';
 
export const ChartLoading = () => (
  <div className="h-full w-full min-h-[200px] flex flex-col items-center justify-center bg-white/40 rounded-xl animate-pulse border-2 border-dashed border-indigo-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3" />
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando datos...</span>
  </div>
);