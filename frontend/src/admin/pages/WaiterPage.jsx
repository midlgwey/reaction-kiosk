import React from 'react'
import WaiterPerformance from '../components/charts/waiter/WaiterPerfomance'
import LatestSuggestionsWidget from '../components/suggestions/LatestSuggestionsWidget';
import WaiterRanking from '../components/tables/WaiterRanking';
import WaiterLogbook from '../components/tables/WaiterLogbook';

const WaiterPage = () => {
  return (
    <div className="space-y-6">

        <div className="w-full">
                 <WaiterRanking />
            </div>
       
                <div className="w-full">
                 <WaiterPerformance />
                </div>
  

              <div className="w-full">
            <WaiterLogbook />
          </div>
    </div>
  )
}

export default WaiterPage