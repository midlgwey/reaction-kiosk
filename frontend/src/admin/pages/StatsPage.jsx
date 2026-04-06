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
        <div className="col-span-12 lg:col-span-5 ">
          <h3 className="text-slate-800 font-bold mb-4 uppercase text-sm tracking-wider">
            Equilibrio de Servicio
          </h3>
          <div className="flex-1 flex justify-center items-center">
            <WeeklyCompRadar/>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 ">
          <h3 className="text-slate-800 font-bold mb-4 uppercase text-sm tracking-wider">
            Satisfacción por Turno y Día
          </h3>
          <div className="flex-1 w-full min-h-75">
             <SatisfactionByShift />
          </div>
        </div>

        <h2>AQUI VA IR LA GRAFICA DE SATISFACCION DE LA PREGUNTA 1 POR MESERO Y ARROJAR EL TOTAL DE MESAS QUE TUVO POR MES</h2>
      </div>

   
    </div>
  )
}

export default StatsPage;