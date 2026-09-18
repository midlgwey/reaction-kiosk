import React from 'react'
import DailyTableCapture from '../components/tables/DailyTableCapture';
import WaiterPerformanceTable from '../components/tables/WaiterPerformanceTable';
import WaiterLogbook from '../components/tables/WaiterLogbook';
import PageHeader from '../components/ui/Pageheader';

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