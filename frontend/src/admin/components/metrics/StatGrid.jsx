import { ChartBarIcon, StarIcon, FaceSmileIcon, ClockIcon  } from '@heroicons/react/24/solid';
import StatCard from './StatCard';

function buildDailyReactionsCard(dailyReactions) {
  if (dailyReactions.loading) {
    return { value: "…", subtitle: "Cargando datos" };
  }

  if (dailyReactions.error) {
    return { value: "—", subtitle: "Error al cargar" };
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
    return { value: "…", subtitle: "Cargando datos" };
  }

  if (serverScore.error) {
    return { value: "—", subtitle: "Error al cargar" };
  }

  if (serverScore.totalResponses === 0) {
    return { value: "—", subtitle: "Sin respuestas hoy" };
  }

  return {
    value: `${serverScore.avgScore.toFixed(1)} / 4`,
    subtitle: "Promedio del servicio hoy",
  };
}

function buildHappinessCard(happiness) {
  if (happiness.loading) {
    return { value: "…", subtitle: "Cargando datos" };
  }

  if (happiness.error) {
    return { value: "—", subtitle: "Error al cargar" };
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
    return { value: "…", subtitle: "Cargando datos" };
  }

  if (happinessByShift.error) {
    return { value: "—", subtitle: "Error al cargar" };
  }

  return {
    value: `${happinessByShift.breakfast}% | ${happinessByShift.lunchDinner}%`,
    subtitle: "Desayuno | Comida y Cena",
  };
}

/* =======================
   COMPONENTE
   ======================= */

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
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <StatCard
        title="TOTAL DE REACCIONES"
        value={reactionsCard.value}
        subtitle={reactionsCard.subtitle}
        icon={<ChartBarIcon className="w-12 h-12 text-emerald-600" />}
      />

      <StatCard
        title="SERVICIO DEL MESERO"
        value={serverCard.value}
        subtitle={serverCard.subtitle}
        icon={<StarIcon className="w-12 h-12 text-amber-400" />}
      />

      <StatCard
        title="ÍNDICE DE FELICIDAD"
        value={happinessCard.value}
        subtitle={happinessCard.subtitle}
        icon={<FaceSmileIcon className="w-12 h-12 text-blue-400" />}
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
        icon={<ClockIcon className="w-12 h-12 text-purple-400" />}
      />
    </div>
  );
}