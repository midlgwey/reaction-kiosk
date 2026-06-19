import StatGridQWeekly from "../components/metrics/StatGridWeekly"
import SatisfactionByShift from "../components/charts/SatisfactionByShift"
import WeeklyCompRadar from "../components/charts/WeeklyCompRadar"
import DailyTableCapture from "../components/table/DailyTableCapture"

const StatsPage = () => {
  return (
    <div className="space-y-6">
      <section>
        <StatGridQWeekly />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 min-w-0  min-h-[450px]">
          <WeeklyCompRadar />
        </div>
        <div className="col-span-12 lg:col-span-8  min-h-[450px]">
          <SatisfactionByShift />
        </div>
      </div>

        <DailyTableCapture />
    </div>
  );
}

export default StatsPage;