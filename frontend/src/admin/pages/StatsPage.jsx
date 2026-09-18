import StatGridQWeekly from "../components/metrics/statscards/StatGridWeekly"
import SatisfactionByShift from "../components/charts/stats/SatisfactionByShift"
import WeeklyCompRadar from "../components/charts/stats/WeeklyCompRadar"

const StatsPage = () => {
  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Tarjetas de métricas semanales */}
        <section>
          <StatGridQWeekly />
        </section>

        {/* Grid: Radar (4 cols) + Satisfacción por turno (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 min-w-0 min-h-[450px]">
            <WeeklyCompRadar />
          </div>
          <div className="lg:col-span-8 min-w-0 min-h-[450px]">
            <SatisfactionByShift />
          </div>
        </div>

      </div>
    </div>
  );
}

export default StatsPage;