import { useMemo } from "react"; 
import SentimentDistributionDoughnut from "../components/charts/SentimentDistributionDoughnut"
import DailySatisfactionArea from "../components/charts/DailySatisfactionArea";
import StatGrid from "../components/metrics/StatGrid"

// Hooks de datos diarios
import {
  useDailyReactions,
  useDailyServerScore,
  useDailyHappinessIndex,
  useDailyHappinessByShift,
} from "../hooks/dashboard/useDashboardSummary";

// Hooks de datos semanales
import {
  useDailySatisfactionTrend,
  useWeeklySentiment,
} from "../hooks/dashboard/useDashboardWeekly";

/**
 * Componente de carga para los contenedores de gráficas.
 * Mantiene la consistencia visual con el tema blanco/slate.
 */
const ChartLoading = () => (
  <div className="h-full min-h-[300px] w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl animate-pulse border-2 border-dashed border-slate-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando métricas...</span>
  </div>
);

export default function DashboardPage() {

  // Obtención de datos mediante custom hooks
  const dailyReactions = useDailyReactions();
  const serverScore = useDailyServerScore();
  const happiness = useDailyHappinessIndex();
  const happinessByShift = useDailyHappinessByShift();
  const trend = useDailySatisfactionTrend();
  const sentiment = useWeeklySentiment();

  // Procesamiento de datos para la gráfica de área (Tendencia)
  // Se utiliza useMemo para evitar recálculos innecesarios en re-renderizados.
  const areaChartData = useMemo(() => {
    if (!trend.data || trend.loading) return { labels: [], values: [] };

    const labels = trend.data.map(d => {
      // Parseo de fecha YYYY-MM-DD
      const [year, month, day] = d.day.split('-'); 
      const date = new Date(year, month - 1, day); 
      return date.toLocaleDateString("es-MX", { weekday: "long" });
    });

    const values = trend.data.map(d =>
      // Normalización de escala: 4 estrellas -> 100%
      Math.round((d.avg_satisfaction / 4) * 100)
    );

    return { labels, values };
  }, [trend.data, trend.loading]);

  // Procesamiento de datos para la gráfica de dona (Sentimientos)
  const sentimentValues = useMemo(() => {
    if (!sentiment.data) return [0, 0, 0, 0];
    return [
      sentiment.data.excelente || 0,
      sentiment.data.bueno || 0,
      sentiment.data.puede_mejorar || 0,
      sentiment.data.malo || 0,
    ];
  }, [sentiment.data]);


  return (
    // Contenedor principal: Se elimina el padding externo (p-6) ya que es gestionado por el AdminLayout.
    // Se mantiene space-y-6 para el ritmo vertical entre secciones.
    <div className="space-y-6">
      
      {/* Sección de KPIs Superiores */}
       <StatGrid
        dailyReactions={dailyReactions}
        serverScore={serverScore}
        happiness={happiness}
        happinessByShift={happinessByShift}
      />

      {/* Sección de Gráficas: Grid de 12 columnas */}
      <div className="grid grid-cols-12 gap-6">
          
          {/* Gráfica de Dona (Distribución)
            - Col-span-4: Ocupa 1/3 del ancho en desktop.
            - Estilo: Fondo blanco con borde sutil (border-slate-200).
            - Layout: Flex column y h-full para igualar altura con el elemento adyacente.
          */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col h-full min-h-[400px]">
            <h3 className="text-slate-800 font-bold mb-6 uppercase text-sm tracking-wider text-center">
              Distribución (Semana)
            </h3>
            
            <div className="flex-1 flex items-center justify-center">
              {sentiment.loading ? (
                 <ChartLoading />
              ) : (
                <SentimentDistributionDoughnut dataValues={sentimentValues} />
              )}
            </div>
          </div>

          {/* Gráfica de Área (Evolución Temporal)
            - Col-span-8: Ocupa 2/3 del ancho en desktop.
            - Estilo unificado con el componente anterior.
          */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col h-full min-h-[400px]">
            <h3 className="text-slate-800 font-bold mb-6 uppercase text-sm tracking-wider text-center">
              Tendencia Diaria (Semana)
            </h3>
            
            <div className="flex-1 flex items-center justify-center w-full">
              {trend.loading ? (
                <ChartLoading />
              ) : (
                <DailySatisfactionArea
                  labels={areaChartData.labels}
                  dataValues={areaChartData.values}
                />
              )}
            </div>
        </div>
      </div>

    </div>
  );
}