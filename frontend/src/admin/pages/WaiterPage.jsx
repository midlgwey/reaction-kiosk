import React from 'react'
import WaiterPerformance from '../components/charts/waiter/WaiterPerfomance'
import WaiterRanking from '../components/tables/WaiterRanking';
import PageHeader from '../components/ui/PageHeader';
import ReporteRendimientoMensual from '../components/tables/ReporteRendimientoMensual';

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