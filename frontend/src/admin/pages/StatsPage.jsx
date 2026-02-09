import TotalQuestionBar from "../components/charts/TotalQuestionsBar"
import StatGridQWeekly from "../components/metrics/StatGridWeekly"
import SatisfactionByShift from "../components/charts/SatisfactionByShift"
import WeeklyCompRadar from "../components/charts/WeeklyCompRadar"

const StatsPage = () => {
  return (
  <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      
      {/* 1. Prioridad: Cards arriba solas */}
      <section>
        <StatGridQWeekly  />
      </section>

      {/* 2. Sección de Análisis Comparativo */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Radar: Ocupa 5 columnas (más compacto para que no se deforme) */}
        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-800 font-bold mb-4 uppercase text-sm tracking-wider">
            Equilibrio de Servicio
          </h3>
          <div className="flex justify-center items-center">
          <WeeklyCompRadar/>
          </div>
        </div>

        {/* Satisfacción por Turno: Ocupa 7 columnas */}
        <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-800 font-bold mb-4 uppercase text-sm tracking-wider">
            Satisfacción por Turno y Día
          </h3>
          <SatisfactionByShift />
        </div>

      </div>

      {/* 3. Sección de Detalle por Pregunta */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full">
        <h3 className="text-slate-800 font-bold mb-6 uppercase text-sm tracking-wider text-center">
          Distribución de Sentimiento por Pregunta
        </h3>
        {/* max-w-5xl para que en monitores ultra-wide no se vea infinita */}
        <div className="max-w-5xl mx-auto">
          <TotalQuestionBar/>
        </div>
      </section>

    </div>
  )
}

export default StatsPage
