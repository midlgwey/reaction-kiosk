import StatGrid from "../components/metrics/dashboardcards/StatGrid";
import DailyQuestions from "../components/charts/DailyQuestions";
import DailySatisfactionArea from "../components/charts/dailysatisfactionarea/DailySatisfactionArea";
import RecentAlerts from "../components/alerts/RecentAlerts";
import LatestSuggestionsWidget from "../components/suggestions/LatestSuggestionsWidget";
 
export default function DashboardPage() {
  return (
    <div className="space-y-6">
 
      <section>
          <StatGrid />
      </section>

  
       <div className="grid grid-cols-12 gap-6">
          <div className="lg:col-span-4 min-w-0">
            <LatestSuggestionsWidget />
          </div>
          <div className="lg:col-span-8 min-w-0">
            <DailyQuestions />
          </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 min-w-0">
            <RecentAlerts />
          </div>
          <div className="lg:col-span-8 min-w-0">
            <DailySatisfactionArea />
          </div>
      </div>
 
    </div>
  );
}
 