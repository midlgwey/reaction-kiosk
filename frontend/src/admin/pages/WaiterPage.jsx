import React from 'react'
import WaiterPerformance from '../components/charts/waiterradiography/WaiterPerfomance'
import LatestSuggestionsWidget from '../components/suggestions/LatestSuggestionsWidget';
import WaiterRanking from '../components/table/WaiterRanking';

const WaiterPage = () => {
  return (
    <div className="space-y-6">

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <WaiterPerformance />
          </div>

          <div className="lg:col-span-4">
          
          <LatestSuggestionsWidget />

          </div>

          <WaiterRanking />

      </div>
          
    </div>
  )
}

export default WaiterPage