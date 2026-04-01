import StatGrid from "../components/metrics/dashboardcards/StatGrid";
import DailyQuestions from "../components/charts/DailyQuestions";
import DailySatisfactionArea from "../components/charts/dailysatisfactionarea/DailySatisfactionArea";
import RecentAlerts from "../components/alerts/RecentAlerts";
 
export default function DashboardPage() {
  return (
    <div className="space-y-6">
 
      <StatGrid />
 
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <DailyQuestions />
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
 