import {
  ShieldCheckIcon,
  ExclamationCircleIcon,
  FireIcon,
  HandThumbDownIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/solid";

import StatCardWeekly from "./StatCardWeekly";
import StatCard from "./StatCard"; // Reutilizamos la card simple para días fuertes/débiles

import {
  useBestQuestionWeek,
  useWorstQuestionWeek,
  useStrongDayWeek,
  useWeakDayWeek,
} from "../../hooks/stats/useStatCard";

// Helpers
const Spinner = () => (
  <div className="flex justify-start">
    <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

const ErrorIcon = () => (
  <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
);


// Builder para preguntas 
function buildQuestionCard(dataState) {
    // Estado de carga inicial
  if (dataState.loading) {
    return { question: <Spinner />, subtitle: null };
  }
    // Manejo de excepciones de red o servidor
  if (dataState.error) {
    return { question: <ErrorIcon />, subtitle: "Error al cargar" };
  }

    // Si ready es false o el dato es nulo, significa que ningúna pregunta
  // alcanzó el umbral mínimo de 5 votos definido en el controlador SQL.
  if (!dataState.ready || !dataState.question || dataState.question === "Sin datos aún") {
    return { 
      question: "Pendiente", 
      subtitle: "Mínimo 5 respuestas requeridas" 
    };
  }

  // Normalización del puntaje a porcentaje
  const percentage = dataState.avg 
    ? Math.round((dataState.avg / 4) * 100) 
    : 0;

  return {
    question: dataState.question,
    subtitle: `${percentage}% satisfacción`
  };
}

// Builder para días 
function buildDayCard(dataState) {
  // Estado de carga inicial
  if (dataState.loading) {
    return { value: <Spinner />, subtitle: null };
  }

  // Manejo de excepciones de red o servidor
  if (dataState.error) {
    return { value: <ErrorIcon />, subtitle: "Error al cargar" };
  }

  // Si ready es false o el dato es nulo, significa que ningún día
  // alcanzó el umbral mínimo de 5 votos definido en el controlador SQL.
  if (!dataState.ready || !dataState.day) {
    return { 
      value: "Pendiente", 
      subtitle: "Mínimo 5 votos requeridos" 
    };
  }
  return {
    value: dataState.day,
    subtitle: `${dataState.percent}% promedio`
  };
}
export default function StatGridWeekly() {
  const best = useBestQuestionWeek();
  const worst = useWorstQuestionWeek();
  const strong = useStrongDayWeek();
  const weak = useWeakDayWeek();

  // Preparamos la data visual
  const bestCard = buildQuestionCard(best);
  const worstCard = buildQuestionCard(worst);
  const strongCard = buildDayCard(strong);
  const weakCard = buildDayCard(weak);

  return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

      {/* MEJOR PREGUNTA */}
      <StatCardWeekly
        title="PREGUNTA MEJOR VALORADA"
        question={bestCard.question}
        subtitle={bestCard.subtitle}
        color="emerald"
        icon={<ShieldCheckIcon className="w-8 h-8 md:w-10 md:h-10 " />}
      />

      {/* PEOR PREGUNTA */}
      <StatCardWeekly
        title="PREGUNTA CON MÁS QUEJAS"
        question={worstCard.question}
        subtitle={worstCard.subtitle}
        color="rose"
        icon={<ExclamationCircleIcon className="w-8 h-8 md:w-10 md:h-10" />}
      />

      {/* DIA FUERTE (Usamos StatCard simple porque es dato corto) */}
      <StatCard
        title="DÍA MÁS FUERTE DE LA SEMANA"
        value={strongCard.value}
        subtitle={strongCard.subtitle} 
        color="amber"
        icon={<FireIcon className="w-8 h-8 md:w-10 md:h-10" />}
      />

      {/* DIA DÉBIL */}
      <StatCard
        title="DÍA MÁS DÉBIL DE LA SEMANA"
        value={weakCard.value}
        subtitle={weakCard.subtitle}
        color="orange"
        icon={<HandThumbDownIcon className="w-8 h-8 md:w-10 md:h-10 " />}
      />

    </div>
  );
}