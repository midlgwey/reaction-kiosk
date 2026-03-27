import { ChartBarIcon, StarIcon, FaceSmileIcon, ClockIcon } from "@heroicons/react/24/solid";
import StatCard from "./StatCard";
import { useStatGrid } from "./useStatGrid";

const Spinner = () => (
  <div className="flex justify-start">
    <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

const ICON_CLASS = "w-8 h-8 md:w-10 md:h-10";

export default function StatGrid() {
  const { reactionsCard, serverScoreCard, happinessCard, shiftCard } = useStatGrid();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

      <StatCard
        title="TOTAL DE REACCIONES"
        value={reactionsCard.value ?? <Spinner />}
        subtitle={reactionsCard.subtitle}
        icon={<ChartBarIcon className={ICON_CLASS} />}
      />

      <StatCard
        title="SERVICIO DEL MESERO"
        value={serverScoreCard.value ?? <Spinner />}
        subtitle={serverScoreCard.subtitle}
        icon={<StarIcon className={ICON_CLASS} />}
        color="amber"
      />

      <StatCard
        title="ÍNDICE DE FELICIDAD"
        value={happinessCard.value ?? <Spinner />}
        subtitle={happinessCard.subtitle}
        icon={<FaceSmileIcon className={ICON_CLASS} />}
        color="blue"
      />

      <StatCard
        title={<>SATISFACCIÓN POR<br />TURNO</>}
        value={shiftCard.value ?? <Spinner />}
        subtitle={shiftCard.subtitle}
        icon={<ClockIcon className={ICON_CLASS} />}
        color="purple"
      />

    </div>
  );
}