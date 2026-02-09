import SentimentDistributionDoughnut from "../components/charts/SentimentDistributionDoughnut"
import DailySatisfactionArea from "../components/charts/DailySatisfactionArea";
import StatGrid from "../components/metrics/StatGrid"

//importando los hooks de cards daily
import {
  useDailyReactions,
  useDailyServerScore,
  useDailyHappinessIndex,
  useDailyHappinessByShift,
} from "../hooks/dashboard/useDashboardSummary";

//hooks semanales
import {
  useDailySatisfactionTrend,
  useWeeklySentiment,
} from "../hooks/dashboard/useDashboardWeekly";


export default function DashboardPage() {

  //  4 hooks diarios
  const dailyReactions = useDailyReactions();
  const serverScore = useDailyServerScore();
  const happiness = useDailyHappinessIndex();
  const happinessByShift = useDailyHappinessByShift();

  // Graficas
  const trend = useDailySatisfactionTrend();
  const sentiment = useWeeklySentiment();

    console.log("DEBUG hooks", {
    dailyReactions,
    serverScore,
    happiness,
    happinessByShift,
  });

     // AREA CHART (satisfacción semanal)
  const labelsArea = trend.data.map(d => {
    const date = new Date(d.day);
    return date.toLocaleDateString("es-MX", { weekday: "long" });
  });

  const valuesArea = trend.data.map(d =>
    Math.round((d.avg_satisfaction / 4) * 100)
  );

  // DONA (sentimientos)
  const sentimentValues = [
    sentiment.data.excelente || 0,
    sentiment.data.bueno || 0,
    sentiment.data.puede_mejorar || 0,
    sentiment.data.malo || 0,
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* FILA DE 4 CARDS */}
       <StatGrid
        dailyReactions={dailyReactions}
        serverScore={serverScore}
        happiness={happiness}
        happinessByShift={happinessByShift}
      />

      <div className="grid grid-cols-12 gap-4">
          {/* GRAFICA ESPIRAL 1/3 */}
          <div className="col-span-12 md:col-span-4 bg-pink-100/50 p-6 rounded-xl shadow-sm">
            <h3 className="text-slate-800 font-bold mb-6 uppercase text-sm tracking-wider text-center">
              Distribución de Reacciones Totales (Semana)
            </h3>
              {sentiment.loading ? (
            <p className="text-center">Cargando...</p>
          ) : (
            <SentimentDistributionDoughnut dataValues={sentimentValues} />
          )}
          </div>

          {/* GRAFICA AREA 2/3 */}
          <div className="col-span-12 md:col-span-8 bg-pink-100/50 p-6 rounded-xl shadow-sm">
            <h3 className="text-slate-800 font-bold mb-6 uppercase text-sm tracking-wider text-center">
              Evolución de la satisfacción diaria (Semana)
            </h3>
            {trend.loading ? (
            <p className="text-center">Cargando...</p>
          ) : (
            <DailySatisfactionArea
              labels={labelsArea}
              dataValues={valuesArea}
            />
          )}
        </div>
        </div>

    </div>
  );
}