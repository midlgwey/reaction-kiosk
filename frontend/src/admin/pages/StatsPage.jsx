import TotalQuestionBar from "../components/charts/TotalQuestionsBar"
import StatGridQWeekly from "../components/metrics/StatGridWeekly"
import SatisfactionByShift from "../components/charts/SatisfactionByShift"
import WeeklyCompRadar from "../components/charts/WeeklyCompRadar"

const StatsPage = () => {
  return (
    // Contenedor principal: Gestiona el ritmo vertical (space-y).
    // Nota: Se elimina el padding externo (p-6) ya que es responsabilidad del AdminLayout.
    <div className="space-y-6">
      
      {/* Sección de Indicadores Clave (KPIs) Semanales */}
      <section>
        <StatGridQWeekly />
      </section>

      {/* Grid de Visualización: Distribución asimétrica de columnas (5/7) */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Gráfica de Radar: Comparativa Semana Actual vs Anterior
            - Layout: Ocupa 5 columnas en desktop (lg).
            - Estilo: Flexbox vertical con 'h-full' para garantizar alineación de altura con la tarjeta adyacente.
        */}
        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="text-slate-800 font-bold mb-4 uppercase text-sm tracking-wider">
            Equilibrio de Servicio
          </h3>
          
          {/* Contenedor interno flexible para centrado vertical y horizontal del canvas */}
          <div className="flex-1 flex justify-center items-center">
            <WeeklyCompRadar/>
          </div>
        </div>

        {/* Gráfica de Barras/Líneas: Satisfacción por Turno
            - Layout: Ocupa 7 columnas en desktop (lg).
            - Justificación: Se asigna mayor ancho para mejorar la legibilidad del eje temporal (X).
        */}
        <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="text-slate-800 font-bold mb-4 uppercase text-sm tracking-wider">
            Satisfacción por Turno y Día
          </h3>
          
          <div className="flex-1 w-full min-h-75">
             <SatisfactionByShift />
          </div>
        </div>

      </div>

      {/* Sección de Detalle: Distribución de Sentimientos
          - Layout: Contenedor de ancho completo.
          - Restricción: Utiliza 'max-w-5xl' para mantener la integridad visual en monitores de alta resolución.
      */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm w-full">
        <h3 className="text-slate-800 font-bold mb-6 uppercase text-sm tracking-wider text-center">
          Distribución de Sentimiento por Pregunta
        </h3>
        
        <div className="max-w-5xl mx-auto">
          <TotalQuestionBar/>
        </div>
      </section>

    </div>
  )
}

export default StatsPage