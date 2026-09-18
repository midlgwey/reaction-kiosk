import StatGrid from "../components/metrics/dashboardcards/StatGrid";
import DailyQuestions from "../components/charts/dashboard/DailyQuestions";
import DailySatisfactionArea from "../components/charts/dashboard/DailySatisfactionArea";
import RecentAlerts from "../components/alerts/RecentAlerts";
import LatestSuggestionsWidget from "../components/suggestions/LatestSuggestionsWidget";

export default function DashboardPage() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Tarjetas de métricas */}
        <section>
          <StatGrid />
        </section>

        {/* Grid: Sugerencias (4 cols) + Preguntas diarias (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 min-w-0">
            <LatestSuggestionsWidget />
          </div>
          <div className="lg:col-span-6 min-w-0">
              <RecentAlerts />
          </div>
        </div>

        {/* Grid: Alertas (4 cols) + Satisfacción (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 min-w-0">
            <DailyQuestions />
          </div>
     
        </div>

      </div>
    </div>
  );
}