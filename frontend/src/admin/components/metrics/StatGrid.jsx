import { ChartBarIcon, StarIcon, FaceSmileIcon, ClockIcon, ExclamationTriangleIcon  } from '@heroicons/react/24/solid';
import StatCard from './StatCard';

const Spinner = () => (
  <div className="flex justify-start">
    <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

const ErrorIcon = () => (
  <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
);

//Helpers
function buildDailyReactionsCard(dailyReactions) {

  if (dailyReactions.loading) {
    return { value: <Spinner />, subtitle: null };
  }

  if (dailyReactions.error) {
    return { value: <ErrorIcon />, subtitle: "Fallo al cargar datos" };
  }

  if (dailyReactions.totalReactions === 0) {
    return { value: "0", subtitle: "Aún no hay respuestas hoy" };
  }

  return {
    value: dailyReactions.totalReactions,
    subtitle: "Total de respuestas del día",
  };
}

function buildServerScoreCard(serverScore) {
  if (serverScore.loading) {
    return { value: <Spinner />,  subtitle: null};
  }

  if (serverScore.error) {
    return { value: <ErrorIcon />, subtitle: "Fallo al cargar datos" };
  }

  if (serverScore.totalResponses === 0) {
    return { value: "0", subtitle: "Aún no hay respuestas hoy" };
  }

  return {
    // Agregamos un chequeo de seguridad (|| 0) por si avgScore viene null
    value: `${(serverScore.avgScore || 0).toFixed(1)} / 4`,
    subtitle: "Promedio del servicio hoy",
  };
}

function buildHappinessCard(happiness) {
  if (happiness.loading) {
    return { value: <Spinner />, subtitle: null };
  }

  if (happiness.error) {
    return { value: <ErrorIcon />, subtitle: "Fallo al cargar datos" };
  }

  if (happiness.totalResponses === 0) {
    return { value: "0%", subtitle: "Aún no hay respuestas hoy" };
  }

  return {
    value: `${happiness.happinessPercent}%`,
    subtitle: "Nivel de satisfacción del día",
  };
}

function buildHappinessByShiftCard(happinessByShift) {
  if (happinessByShift.loading) {
    return { value: <Spinner />, subtitle: null };
  }

  if (happinessByShift.error) {
    return { value: <ErrorIcon />, subtitle: "Fallo al cargar datos" };
  }

  return {
    value: `${happinessByShift.breakfast}% | ${happinessByShift.lunchDinner}%`,
    subtitle: "Desayuno | Comida y Cena",
  };
}

export default function StatGrid({
  dailyReactions,
  serverScore,
  happiness,
  happinessByShift,
}) {
   
    const reactionsCard = buildDailyReactionsCard(dailyReactions);
    const serverCard = buildServerScoreCard(serverScore);
    const happinessCard = buildHappinessCard(happiness);
    const shiftCard = buildHappinessByShiftCard(happinessByShift);

   return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
  
      <StatCard
        title="TOTAL DE REACCIONES"
        value={reactionsCard.value}
        subtitle={reactionsCard.subtitle}
        icon={<ChartBarIcon className="w-8 h-8 md:w-10 md:h-10 " />}
      />

      <StatCard
        title="SERVICIO DEL MESERO"
        value={serverCard.value}
        subtitle={serverCard.subtitle}
        icon={<StarIcon className="w-8 h-8 md:w-10 md:h-10 " />}
        color="amber"
      />

      <StatCard
        title="ÍNDICE DE FELICIDAD"
        value={happinessCard.value}
        subtitle={happinessCard.subtitle}
        icon={<FaceSmileIcon className="w-8 h-8 md:w-10 md:h-10 " />}
        color="blue"
      />

      <StatCard
        title={
          <>
            SATISFACCIÓN POR
            <br />
            TURNO
          </>
        }
        value={shiftCard.value}
        subtitle={shiftCard.subtitle}
        icon={<ClockIcon className="w-8 h-8 md:w-10 md:h-10 " />}
        color="purple"
      />
    </div>
  );
}