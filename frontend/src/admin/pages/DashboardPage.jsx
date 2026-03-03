import { useMemo, useState } from "react"; 
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

// Hooks de datos temporales
import {
  useDailySatisfactionTrend,
  useWeeklySentiment,
} from "../hooks/dashboard/useDashboardWeekly";

// Componente indicador de carga
const ChartLoading = () => (
  <div className="h-full min-h-[300px] w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl animate-pulse border-2 border-dashed border-slate-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando métricas...</span>
  </div>
);

export default function DashboardPage() {
  // Estado para el control global del periodo analizado en las gráficas
  const [chartPeriod, setChartPeriod] = useState(7);

  // Obtención de datos mediante custom hooks
  const dailyReactions = useDailyReactions();
  const serverScore = useDailyServerScore();
  const happiness = useDailyHappinessIndex();
  const happinessByShift = useDailyHappinessByShift();

  // Ejecución de hooks temporales con el periodo seleccionado
  const trend = useDailySatisfactionTrend({ days: chartPeriod });
  const sentiment = useWeeklySentiment({ days: chartPeriod });

  // Procesamiento de datos para la gráfica de área (Tendencia)
  const areaChartData = useMemo(() => {
    if (!trend.data || trend.loading) return { labels: [], values: [] };

    const labels = trend.data.map(d => {
      // Parseo seguro de fecha
      const [year, month, day] = d.day.split('-'); 
      const date = new Date(year, month - 1, day); 
      // Formato abreviado si hay muchos días, completo si son pocos
      return chartPeriod > 7 
        ? date.toLocaleDateString("es-MX", { day: '2-digit', month: 'short' })
        : date.toLocaleDateString("es-MX", { weekday: "long" });
    });

    const values = trend.data.map(d =>
      Math.round((d.avg_satisfaction / 4) * 100)
    );

    return { labels, values };
  }, [trend.data, trend.loading, chartPeriod]);

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
    <div className="space-y-6">
      
      {/* Sección de KPIs Superiores (Siempre muestran datos del día actual) */}
       <StatGrid
        dailyReactions={dailyReactions}
        serverScore={serverScore}
        happiness={happiness}
        happinessByShift={happinessByShift}
      />

      {/* Controles globales para la sección de gráficas */}
      <div className="flex justify-end items-center px-2">
        <label className="text-sm font-semibold text-slate-600 mr-3">
            Analizar periodo:
        </label>
        <select 
          className="text-sm bg-white border border-slate-300 text-slate-700 rounded-lg p-2 font-medium cursor-pointer focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          value={chartPeriod}
          onChange={(e) => setChartPeriod(Number(e.target.value))}
        >
          <option value={7}>Últimos 7 días</option>
          <option value={15}>Últimos 15 días</option>
          <option value={30}>Últimos 30 días</option>
        </select>
      </div>

      {/* Sección de Gráficas: Grid de 12 columnas */}
      <div className="grid grid-cols-12 gap-6">
          
          {/* Gráfica de Dona (Distribución) */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col h-full min-h-[400px]">
            <h3 className="text-slate-800 font-bold mb-6 uppercase text-sm tracking-wider text-center">
              Distribución ({chartPeriod} días)
            </h3>
            
            <div className="flex-1 flex items-center justify-center">
              {sentiment.loading ? (
                 <ChartLoading />
              ) : (
                <SentimentDistributionDoughnut dataValues={sentimentValues} />
              )}
            </div>
          </div>

          {/* Gráfica de Área (Evolución Temporal) */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col h-full min-h-[400px]">
            <h3 className="text-slate-800 font-bold mb-6 uppercase text-sm tracking-wider text-center">
              Tendencia Diaria ({chartPeriod} días)
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