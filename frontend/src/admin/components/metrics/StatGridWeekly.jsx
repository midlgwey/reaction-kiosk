import {
  ShieldCheckIcon,
  ExclamationCircleIcon,
  FireIcon,
  HandThumbDownIcon,
} from "@heroicons/react/24/solid";

import StatCardWeekly from "./StatCardWeekly";
import StatCard from "./StatCard";

import {
  useBestQuestionWeek,
  useWorstQuestionWeek,
  useStrongDayWeek,
  useWeakDayWeek,
} from "../../hooks/stats/useStatCard";

export default function StatGridWeekly() {
  const best = useBestQuestionWeek();
  const worst = useWorstQuestionWeek();
  const strong = useStrongDayWeek();
  const weak = useWeakDayWeek();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

      {/* MEJOR PREGUNTA */}
      <StatCardWeekly
        title="PREGUNTA MEJOR VALORADA"
        question={best.loading ? "Cargando..." : best.question || "Sin datos"}
        subtitle={
          best.loading
            ? "..."
            : best.avg
            ? `${Math.round((best.avg / 4) * 100)}% satisfacción`
            : "Sin datos"
        }
        icon={<ShieldCheckIcon className="w-12 h-12 text-emerald-600" />}
      />

      {/* PEOR PREGUNTA */}
      <StatCardWeekly
        title="PREGUNTA CON MÁS QUEJAS"
        question={worst.loading ? "Cargando..." : worst.question || "Sin datos"}
        subtitle={
          worst.loading
            ? "..."
            : worst.avg
            ? `${Math.round((worst.avg / 4) * 100)}% satisfacción`
            : "Sin datos"
        }
        icon={<ExclamationCircleIcon className="w-12 h-12 text-red-600" />}
      />

      {/* DIA FUERTE */}
      <StatCard
        title="DÍA MÁS FUERTE"
        value={
          strong.loading
            ? "..."
            : strong.ready
            ? strong.day
            : "Sin datos"
        }
        subtitle="Mejor satisfacción"
        icon={<FireIcon className="w-12 h-12 text-orange-600" />}
      />

      {/* DIA DÉBIL */}
      <StatCard
        title="DÍA MÁS DÉBIL"
        value={
          weak.loading
            ? "..."
            : weak.ready
            ? weak.day
            : "Sin datos"
        }
        subtitle="Menor satisfacción"
        icon={<HandThumbDownIcon className="w-12 h-12 text-blue-700" />}
      />

    </div>
  );
}
