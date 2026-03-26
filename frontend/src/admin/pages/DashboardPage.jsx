import { useMemo, useState } from "react"; 
import { format } from "date-fns";
import SentimentDistributionDoughnut from "../components/charts/SentimentDistributionDoughnut";
import DailySatisfactionArea from "../components/charts/DailySatisfactionArea";
import StatGrid from "../components/metrics/StatGrid";
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
import RecentAlerts from "../components/alerts/RecentAlerts";

/**
 * Componente indicador de estado de carga.
 * Muestra una animación de interfaz mientras se resuelven las peticiones asíncronas de las gráficas.
 */
const ChartLoading = () => (
  <div className="h-full min-h-[300px] w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl animate-pulse border-2 border-dashed border-slate-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">Cargando métricas...</span>
  </div>
);

/**
 * Configuraciones de opciones para los filtros de las gráficas.
 * La dona permite seleccionar un día específico o usar el calendario.
 * La gráfica de área omite opciones de un solo día ya que requiere rangos amplios para trazar la tendencia.
 */
const DONA_OPTIONS = [
  { value: '1', label: 'Hoy' },
  { value: '7', label: 'Últimos 7 días' },
  { value: '15', label: 'Últimos 15 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: 'custom', label: '📅 Elegir día exacto' },
];

const AREA_OPTIONS = [
  { value: '7', label: 'Última Semana' },
  { value: '14', label: 'Últimas 2 Semanas' },
  { value: '21', label: 'Últimas 3 Semanas' },
  { value: '30', label: 'Último Mes' },
  { value: '90', label: 'Últimos 3 Meses ' },
  { value: '180', label: 'Últimos 6 Meses' },
];

export default function DashboardPage() {
  // Gestión de estado para el filtro de la gráfica de Dona
  const [donaOption, setDonaOption] = useState(DONA_OPTIONS[1]); // Valor inicial: 7 días
  const [donaCustomDate, setDonaCustomDate] = useState(new Date());

  // Gestión de estado para el filtro de la gráfica de Área
  const [areaOption, setAreaOption] = useState(AREA_OPTIONS[0]); // Valor inicial: 7 días
  const [areaCustomDate, setAreaCustomDate] = useState(new Date());

  // Construcción dinámica de los parámetros de consulta para la Dona
  const donaParams = useMemo(() => {
    if (donaOption.value === 'custom') {
      const dateStr = format(donaCustomDate, 'yyyy-MM-dd');
      return { startDate: dateStr, endDate: dateStr };
    }
    return { days: Number(donaOption.value) };
  }, [donaOption, donaCustomDate]);

  // Construcción dinámica de los parámetros de consulta para el Área
  const areaParams = useMemo(() => {
    return { days: Number(areaOption.value) };
  }, [areaOption]);

  // Consumo de hooks para datos temporales (Gráficas dinámicas)
  const trend = useDailySatisfactionTrend(areaParams);
  const sentiment = useWeeklySentiment(donaParams);
  
  // Consumo de hooks para los KPIs superiores (Datos fijos del día en curso)
  const dailyReactions = useDailyReactions();
  const serverScore = useDailyServerScore();
  const happiness = useDailyHappinessIndex();
  const happinessByShift = useDailyHappinessByShift();

  // Mapeo y formateo de la respuesta del servidor para la gráfica de tendencia (Chart.js)
  const areaChartData = useMemo(() => {
    if (!trend.data || trend.loading) return { labels: [], values: [] };
    
    const labels = trend.data.map(d => {
      const [year, month, day] = d.day.split('-');
      const date = new Date(year, month - 1, day);
      
      // Ajuste de formato: si el rango supera los 7 días, se simplifica la etiqueta
      return areaParams.days > 7 
        ? format(date, 'dd MMM') 
        : date.toLocaleDateString("es-MX", { weekday: "long" });
    });
    
    const values = trend.data.map(d => Math.round((d.avg_satisfaction / 4) * 100));
    
    return { labels, values };
  }, [trend.data, trend.loading, areaParams]);

  // Mapeo y formateo de la respuesta del servidor para la gráfica de distribución (Chart.js)
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
      
      {/* Sección 1: Indicadores clave de rendimiento (KPIs) */}
      <StatGrid 
        dailyReactions={dailyReactions} 
        serverScore={serverScore} 
        happiness={happiness} 
        happinessByShift={happinessByShift} 
      />

      {/* Sección 2: Desglose de respuestas por pregunta */}
       <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
         <DailyQuestions />
       </div>

        {/* Sección 2: Desglose de respuestas por pregunta */}
       <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
         <RecentAlerts />
       </div>

      {/* Sección 3: Representaciones gráficas compuestas */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Contenedor: Distribución Sentimental (Dona) */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col min-h-[450px]">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
              Distribución Sentimental
            </h3>
            <DashboardFilter 
              options={DONA_OPTIONS} 
              selectedOption={donaOption} 
              setSelectedOption={setDonaOption} 
              selectedDay={donaCustomDate} 
              setSelectedDay={setDonaCustomDate} 
            />
          </div>
         <div className="flex-1 flex items-center justify-center">
            {sentiment.loading ? (
              <ChartLoading />
            ) : !sentiment.data || sentiment.data.total === 0 ? ( /* Validación de datos nulos o en cero */
              <div className="h-full flex items-center justify-center text-slate-400 text-center font-medium text-sm">
                No hay encuestas en esta fecha
              </div>
            ) : (
              <SentimentDistributionDoughnut dataValues={sentimentValues} />
            )}
          </div>
        </div>

        {/* Contenedor: Tendencia de Satisfacción (Área) */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col min-h-[450px]">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
              Tendencia de Satisfacción
            </h3>
            <DashboardFilter 
              options={AREA_OPTIONS} 
              selectedOption={areaOption} 
              setSelectedOption={setAreaOption} 
              selectedDay={areaCustomDate} 
              setSelectedDay={setAreaCustomDate} 
            />
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
        
      </div>
    </div>
  );
}