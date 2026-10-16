import StatGridQWeekly from "../components/metrics/statscards/StatGridWeekly"
import SatisfactionByShift from "../components/charts/stats/SatisfactionByShift"
import QuestionDistributionChart from "../components/charts/stats/QuestionDistributionChart"
import SurveyAcceptanceChart from "../components/charts/stats/SurveyAcceptanceChart"
import QuestionTrendChart from "../components/charts/stats/QuestionTrendChart"

const StatsPage = () => {
  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Tarjetas de métricas semanales */}
        <section>
          <StatGridQWeekly />
        </section>

        {/* Fila 1: Distribución por pregunta (5 cols) + Aceptación (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 min-w-0 min-h-[450px]">
            <QuestionDistributionChart />
          </div>
          <div className="lg:col-span-7 min-w-0 min-h-[450px]">
            <SurveyAcceptanceChart />
          </div>
        </div>

       
        {/* Fila 2: Evolución por pregunta — ancho completo */}
        <div className="min-h-[420px]">
          <QuestionTrendChart />
        </div>

        {/* Fila 3: Satisfacción por turno y día — ancho completo */}
        <div className="min-h-[420px]">
          <SatisfactionByShift />
        </div>

      </div>
    </div>
  );
}

export default StatsPage;