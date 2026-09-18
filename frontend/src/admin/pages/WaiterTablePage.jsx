import React from 'react'
import DailyTableCapture from '../components/tables/DailyTableCapture';
import WaiterPerformanceTable from '../components/tables/WaiterPerformanceTable';
import WaiterLogbook from '../components/tables/WaiterLogbook';

/**
 * PageHeader - Componente reutilizable para encabezados
 */
function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight border-l-4 border-indigo-600 pl-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm mt-2 text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}


const WaiterPage = () => {
  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <PageHeader title="Meseros" subtitle="Registro de mesas diarias, desempeño y bitácora mensual" />

        <div className="w-full">
          <DailyTableCapture />
        </div>
        <div className="w-full">
          <WaiterPerformanceTable />
        </div>
        <div className="w-full">
          <WaiterLogbook />
        </div>
      </div>
    </div>
  )
}

export default WaiterPage