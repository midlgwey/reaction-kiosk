import React from 'react'
import WaiterPerformance from '../components/charts/waiterradiography/WaiterPerfomance'
import LatestSuggestionsWidget from '../components/suggestions/LatestSuggestionsWidget';
import WaiterRanking from '../components/table/WaiterRanking';

const WaiterPage = () => {
  return (
    <div className="space-y-6">

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <WaiterPerformance />
            </div>
       
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-4">
                <WaiterRanking />
              </div>
              <div className="col-span-12 lg:col-span-8">
                <LatestSuggestionsWidget />
              </div>
            </div>
          
    </div>
  )
}

export default WaiterPage