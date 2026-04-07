import StatGridQWeekly from "../components/metrics/StatGridWeekly"
import SatisfactionByShift from "../components/charts/SatisfactionByShift"
import WeeklyCompRadar from "../components/charts/WeeklyCompRadar"

const StatsPage = () => {
  return (
    <div className="space-y-6">
      <section>
        <StatGridQWeekly />
      </section>

        <div className="grid grid-cols-12 gap-6">
            <div className="lg:col-span-4 min-w-0">
              <WeeklyCompRadar/>
            </div>
              <div className="lg:col-span-8 min-w-0">
             <SatisfactionByShift />
          </div>
        </div>

          

        <h2>AQUI VA IR LA GRgdfgfdgdgAFICA DE SATISFACCION DE LA PREGUNTA 1 POR MESERO Y ARROJAR EL TOTAL DE MESAS QUE TUVO POR MES</h2>
      </div>

  )
}

export default StatsPage;