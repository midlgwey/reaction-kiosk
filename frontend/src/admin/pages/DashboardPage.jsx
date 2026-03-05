import { useMemo, useState } from "react"; 
import SentimentDistributionDoughnut from "../components/charts/SentimentDistributionDoughnut"
import DailySatisfactionArea from "../components/charts/DailySatisfactionArea";
import StatGrid from "../components/metrics/StatGrid"
import DailyQuestions from "../components/charts/DailyQuestions";

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


// Componente indicador de estado de carga
const ChartLoading = () => (
  <div className="h-full min-h-[300px] w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl animate-pulse border-2 border-dashed border-slate-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando métricas...</span>
  </div>
);

export default function DashboardPage() {
  // Estados independientes para el control de periodos por gráfica
  const [donaPeriod, setDonaPeriod] = useState(7);
  const [areaPeriod, setAreaPeriod] = useState(7);

  // Obtención de datos de KPIs superiores
  const dailyReactions = useDailyReactions();
  const serverScore = useDailyServerScore();
  const happiness = useDailyHappinessIndex();
  const happinessByShift = useDailyHappinessByShift();

  // Ejecución de hooks temporales con sus respectivos periodos
  const trend = useDailySatisfactionTrend({ days: areaPeriod });
  const sentiment = useWeeklySentiment({ days: donaPeriod });

  // Procesamiento de datos para la gráfica de Área (Tendencia)
  const areaChartData = useMemo(() => {
    if (!trend.data || trend.loading) return { labels: [], values: [] };

    const labels = trend.data.map(d => {
      const [year, month, day] = d.day.split('-'); 
      const date = new Date(year, month - 1, day); 
      // Ajuste de formato de fecha según la amplitud del periodo
      return areaPeriod > 7 
        ? date.toLocaleDateString("es-MX", { day: '2-digit', month: 'short' })
        : date.toLocaleDateString("es-MX", { weekday: "long" });
    });

    const values = trend.data.map(d =>
      Math.round((d.avg_satisfaction / 4) * 100)
    );

    return { labels, values };
  }, [trend.data, trend.loading, areaPeriod]);

  // Procesamiento de datos para la gráfica de Dona (Sentimientos)
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
      
      {/* KPIs Superiores (Datos estáticos del día actual) */}
       <StatGrid
        dailyReactions={dailyReactions}
        serverScore={serverScore}
        happiness={happiness}
        happinessByShift={happinessByShift}
      />

      {/* Sección de Gráficas: Grid de 12 columnas */}
      <div className="grid grid-cols-12 gap-6">
          
          {/* Gráfica de Dona (Distribución) */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col h-full min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
                Distribución Sentimental
              </h3>
              <select 
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-1.5 font-medium cursor-pointer focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={donaPeriod}
                onChange={(e) => setDonaPeriod(Number(e.target.value))}
              >
                <option value={1}>Hoy</option>
                <option value={7}>Últimos 7 días</option>
                <option value={15}>Últimos 15 días</option>
                <option value={30}>Últimos 30 días</option>
              </select>
            </div>
            
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
                Tendencia Diaria
              </h3>
              <select 
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-1.5 font-medium cursor-pointer focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={areaPeriod}
                onChange={(e) => setAreaPeriod(Number(e.target.value))}
              >
                <option value={7}>Últimos 7 días</option>
                <option value={15}>Últimos 15 días</option>
                <option value={30}>Últimos 30 días</option>
              </select>
            </div>
            
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
       
        {/* Gráfica de Barras por Pregunta (Análisis Detallado) */}
         <DailyQuestions />
         
      </div>
    </div>
  );
}

              
