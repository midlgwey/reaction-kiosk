import {
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftRightIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/solid";

import StatCardWeekly from "./StatCardWeekly";

import {
  useBestQuestionWeek,
  useWorstQuestionWeek,
  useWeeklyDeclinesTrend,
  useWeeklyTotalSurveys,
} from "../../../hooks/stats/useStatCard";

// Helpers
const Spinner = () => (
  <div className="flex justify-start">
    <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

const ErrorIcon = () => (
  <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
);

// Builder para preguntas (mejor/peor)
function buildQuestionCard(dataState) {
  if (dataState.loading) {
    return { question: <Spinner />, subtitle: null, trend: null };
  }
  if (dataState.error) {
    return { question: <ErrorIcon />, subtitle: "Error al cargar", trend: null };
  }
  if (!dataState.ready || !dataState.question || dataState.question === "Sin datos aún") {
    return { 
      question: "Pendiente", 
      subtitle: "Mínimo 5 encuestas requeridas",
      trend: null
    };
  }

  const percentage = dataState.avg 
    ? Math.round((dataState.avg / 4) * 100) 
    : 0;

  return {
    question: dataState.question,
    subtitle: `${percentage}% satisfacción`,
    trend: dataState.trend
  };
}

// Builder para cards numéricas (rechazos, total encuestas)
function buildCountCard(dataState) {
  if (dataState.loading) {
    return { question: <Spinner />, subtitle: null, trend: null };
  }
  if (dataState.error) {
    return { question: <ErrorIcon />, subtitle: "Error al cargar", trend: null };
  }

  return {
    question: dataState.total ?? 0,
    subtitle: "Esta semana",
    trend: dataState.trend
  };
}

export default function StatGridWeekly() {
  const best = useBestQuestionWeek();
  const worst = useWorstQuestionWeek();
  const declines = useWeeklyDeclinesTrend();
  const totalSurveys = useWeeklyTotalSurveys();

  const bestCard = buildQuestionCard(best);
  const worstCard = buildQuestionCard(worst);
  const declinesCard = buildCountCard(declines);
  const surveysCard = buildCountCard(totalSurveys);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

      {/* MEJOR PREGUNTA */}
      <StatCardWeekly
        title="PREGUNTA MEJOR VALORADA"
        question={bestCard.question}
        subtitle={bestCard.subtitle}
        trend={bestCard.trend}
        color="emerald"
        icon={<ShieldCheckIcon className="w-8 h-8 md:w-10 md:h-10" />}
      />

      {/* PEOR PREGUNTA */}
      <StatCardWeekly
        title="PREGUNTA CON MÁS QUEJAS"
        question={worstCard.question}
        subtitle={worstCard.subtitle}
        trend={worstCard.trend}
        color="rose"
        icon={<ExclamationCircleIcon className="w-8 h-8 md:w-10 md:h-10" />}
      />

      {/* TOTAL ENCUESTAS */}
      <StatCardWeekly
        title="TOTAL DE ENCUESTAS"
        question={surveysCard.question}
        subtitle={surveysCard.subtitle}
        trend={surveysCard.trend}
        color="indigo"
        icon={<ChatBubbleLeftRightIcon className="w-8 h-8 md:w-10 md:h-10" />}
      />

      {/* RECHAZOS */}
      <StatCardWeekly
        title="RECHAZOS DE LA SEMANA"
        question={declinesCard.question}
        subtitle={declinesCard.subtitle}
        trend={declinesCard.trend}
        color="amber"
        icon={<NoSymbolIcon className="w-8 h-8 md:w-10 md:h-10" />}
      />

    </div>
  );
}