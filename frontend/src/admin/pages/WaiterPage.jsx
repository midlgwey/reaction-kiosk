import React from 'react'
import WaiterPerformance from '../components/charts/waiter/WaiterPerfomance'
import WaiterRanking from '../components/tables/WaiterRanking';
import ReporteRendimientoMensual from '../components/tables/ReporteRendimientoMensual';

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
        
        {/* Encabezado */}
        <PageHeader 
          title="Meseros" 
          subtitle="Tabla de ranking de meseros y desempeño por colaborador" 
        />

          <div className="w-full">
            <WaiterRanking />
          </div>
          <div className="w-full">
            <WaiterPerformance />
          </div>

            <div className="w-full">
            <ReporteRendimientoMensual/>
          </div>
        </div>

     
  
    </div>
  )
}

export default WaiterPage