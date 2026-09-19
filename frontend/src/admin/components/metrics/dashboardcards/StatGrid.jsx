import { 
  ChartBarIcon, 
  StarIcon, 
  ArrowTrendingDownIcon, 
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/solid";
import StatCard from "./StatCard";
import { useStatGrid } from "./useStatGrid";

const Spinner = () => (
  <div className="flex justify-start">
    <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

const ICON_CLASS = "w-8 h-8 md:w-10 md:h-10";

export default function StatGrid() {
  const { 
    reactionsCard, 
    serverScoreCard, 
    lowInteractionCard, 
    surveyCountCard,
    lowestRatedWaiterCard,
    worstRatedQuestionCard
  } = useStatGrid();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

      {/* Card 1: ENCUESTAS DEL DÍA */}
      <StatCard
        title="ENCUESTAS DEL DÍA"
        value={surveyCountCard.value ?? <Spinner />}
        subtitle={surveyCountCard.subtitle}
        icon={<ClipboardDocumentCheckIcon className={ICON_CLASS} />}
        color="indigo"
        trend={surveyCountCard.trend}
        trendTooltip={surveyCountCard.trendTooltip}
      />

   {/* Card 2: PREGUNTA PEOR CALIFICADA */}
      <StatCard
        title="PREGUNTA PEOR CALIFICADA DEL DÍA"
        value={worstRatedQuestionCard.value ?? <Spinner />}
        subtitle={worstRatedQuestionCard.subtitle}
        tooltip={worstRatedQuestionCard.tooltip}
        icon={<QuestionMarkCircleIcon className={ICON_CLASS} />}
        color="purple"
        trend={worstRatedQuestionCard.trend}
        trendTooltip={worstRatedQuestionCard.trendTooltip}
      />

      {/* Card 3: MESERO CON BAJA CALIFICACIÓN */}
      <StatCard
        title="MESERO CON BAJA CALIFICACIÓN"
        value={lowestRatedWaiterCard.value ?? <Spinner />}
        subtitle={lowestRatedWaiterCard.subtitle}
        icon={<ExclamationTriangleIcon className={ICON_CLASS} />}
        color="rose"
        trend={lowestRatedWaiterCard.trend}
        trendTooltip={lowestRatedWaiterCard.trendTooltip}
      />

      {/* Card 4: MESEROS CON MENOS INTERACCIONES */}
      <StatCard
        title="MESEROS CON MENOS INTERACCIONES"
        value={lowInteractionCard.value ?? <Spinner />}
        subtitle={lowInteractionCard.subtitle}
        tooltip={lowInteractionCard.tooltip}
        icon={<ArrowTrendingDownIcon className={ICON_CLASS} />}
        color="orange"
      />

    </div>
  );
}