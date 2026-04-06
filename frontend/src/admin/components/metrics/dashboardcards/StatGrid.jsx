import { ChartBarIcon, StarIcon, ArrowTrendingDownIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/solid";
import StatCard from "./StatCard";
import { useStatGrid } from "./useStatGrid";

const Spinner = () => (
  <div className="flex justify-start">
    <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

const ICON_CLASS = "w-8 h-8 md:w-10 md:h-10";

export default function StatGrid() {
  const { reactionsCard, serverScoreCard, lowInteractionCard, surveyCountCard } = useStatGrid();

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
        title="MESEROS CON MENOS INTERACCIONES"
        value={lowInteractionCard.value ?? <Spinner />}
        subtitle={lowInteractionCard.subtitle}
        icon={<ArrowTrendingDownIcon className={ICON_CLASS} />}
        color="orange"
      />

     <StatCard
        title="ENCUESTAS DEL DÍA"
        value={surveyCountCard.value ?? <Spinner />}
        subtitle={surveyCountCard.subtitle}
        icon={<ClipboardDocumentCheckIcon className={ICON_CLASS} />}
        color="indigo"
      />

    </div>
  );
}