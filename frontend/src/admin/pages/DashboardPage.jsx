import { useMemo, useState } from "react"; 
import { format } from "date-fns";
import SentimentDistributionDoughnut from "../components/charts/SentimentDistributionDoughnut"
import DailySatisfactionArea from "../components/charts/DailySatisfactionArea";
import StatGrid from "../components/metrics/StatGrid"
import DailyQuestions from "../components/charts/DailyQuestions";
import DashboardFilter from "../components/shared/DashboardFilter";

import {
  useDailyReactions,
  useDailyServerScore,
  useDailyHappinessIndex,
  useDailyHappinessByShift,
} from "../hooks/dashboard/useDashboardSummary";

import {
  useDailySatisfactionTrend,
  useWeeklySentiment,
} from "../hooks/dashboard/useDashboardWeekly";

const ChartLoading = () => (
  <div className="h-full min-h-[300px] w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl animate-pulse border-2 border-dashed border-slate-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando métricas...</span>
  </div>
);

export default function DashboardPage() {
  // Estados para Filtros de Dona
  const [donaOption, setDonaOption] = useState({ value: '7', label: 'Últimos 7 días' });
  const [donaCustomDate, setDonaCustomDate] = useState(new Date());

  // Estados para Filtros de Área
  const [areaOption, setAreaOption] = useState({ value: '7', label: 'Últimos 7 días' });
  const [areaCustomDate, setAreaCustomDate] = useState(new Date());

  // Memoización de parámetros para los Hooks
  const donaParams = useMemo(() => {
    if (donaOption.value === 'custom') {
      const dateStr = format(donaCustomDate, 'yyyy-MM-dd');
      return { startDate: dateStr, endDate: dateStr };
    }
    return { days: Number(donaOption.value) };
  }, [donaOption, donaCustomDate]);

  const areaParams = useMemo(() => {
    if (areaOption.value === 'custom') {
      const dateStr = format(areaCustomDate, 'yyyy-MM-dd');
      return { startDate: dateStr, endDate: dateStr };
    }
    return { days: Number(areaOption.value) };
  }, [areaOption, areaCustomDate]);

  // Ejecución de Hooks
  const trend = useDailySatisfactionTrend(areaParams);
  const sentiment = useWeeklySentiment(donaParams);
  
  // KPIs (Siempre Hoy)
  const dailyReactions = useDailyReactions();
  const serverScore = useDailyServerScore();
  const happiness = useDailyHappinessIndex();
  const happinessByShift = useDailyHappinessByShift();

  // Procesamiento para Área
  const areaChartData = useMemo(() => {
    if (!trend.data || trend.loading) return { labels: [], values: [] };
    const labels = trend.data.map(d => {
      const [y, m, day] = d.day.split('-');
      const date = new Date(y, m - 1, day);
      return areaParams.days > 7 
        ? format(date, 'dd MMM') 
        : date.toLocaleDateString("es-MX", { weekday: "long" });
    });
    const values = trend.data.map(d => Math.round((d.avg_satisfaction / 4) * 100));
    return { labels, values };
  }, [trend.data, trend.loading, areaParams]);

  // Procesamiento para Dona
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
      <StatGrid dailyReactions={dailyReactions} serverScore={serverScore} happiness={happiness} happinessByShift={happinessByShift} />

      <DailyQuestions />

      <div className="grid grid-cols-12 gap-6">
        {/* Gráfica de Dona */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col min-h-[450px]">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">Distribución Sentimental</h3>
            <DashboardFilter 
              selectedOption={donaOption} 
              setSelectedOption={setDonaOption} 
              selectedDay={donaCustomDate} 
              setSelectedDay={setDonaCustomDate} 
            />
          </div>
          <div className="flex-1 flex items-center justify-center">
            {sentiment.loading ? <ChartLoading /> : <SentimentDistributionDoughnut dataValues={sentimentValues} />}
          </div>
        </div>

        {/* Gráfica de Área */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col min-h-[450px]">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">Tendencia de Satisfacción</h3>
            <DashboardFilter 
              selectedOption={areaOption} 
              setSelectedOption={setAreaOption} 
              selectedDay={areaCustomDate} 
              setSelectedDay={setAreaCustomDate} 
            />
          </div>
          <div className="flex-1 flex items-center justify-center">
            {trend.loading ? <ChartLoading /> : <DailySatisfactionArea labels={areaChartData.labels} dataValues={areaChartData.values} />}
          </div>
        </div>
      </div>
    </div>
  );
}