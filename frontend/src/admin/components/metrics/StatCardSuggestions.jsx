import React from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  MegaphoneIcon, 
  ClockIcon, 
  HandThumbUpIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/solid'; 
import StatCard from '../metrics/StatCard';
import { useFeedbackStats } from '../../../admin/hooks/feedback/useSuggestionsStats';

const Spinner = () => (
  <div className="flex justify-start py-1">
    <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

const ErrorIcon = () => (
  <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
);

function buildStatResult(data, loading, error, subtitleDefault) {
  // Estado de Carga
  if (loading) {
    return { value: <Spinner />, subtitle: null };
  }

  // Estado de Error
  if (error) {
    return { value: <ErrorIcon />, subtitle: "Fallo al cargar" };
  }

  // Estado de Éxito (Datos listos)
  return { 
    value: data || "N/A", 
    subtitle: subtitleDefault 
  };
}

export default function FeedbackStats() {

  const { stats, loading, error } = useFeedbackStats();

  const total = buildStatResult(stats.total, loading, error, "Total de sugerencias hoy");
  const shift = buildStatResult(stats.criticalShift, loading, error, "Turno con más reportes");
  const focus = buildStatResult(stats.mainComplaint, loading, error, "Foco de atención hoy");
  const strong = buildStatResult(stats.strongPoint, loading, error, "Lo mejor calificado");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      
      <StatCard 
        title="TOTAL SUGERENCIAS" 
        value={total.value} 
        subtitle={total.subtitle}
        icon={<ChatBubbleLeftRightIcon />}
        color="indigo"
      />

      <StatCard 
        title="TURNO CRÍTICO" 
        value={shift.value} 
        subtitle={shift.subtitle}
        icon={<ClockIcon />}
        color="rose"
      />

      <StatCard 
        title="FOCO DE ATENCIÓN" 
        value={focus.value} 
        subtitle={focus.subtitle}
        icon={<MegaphoneIcon />}
        color="orange"
      />

      <StatCard 
        title="PUNTO FUERTE" 
        value={strong.value} 
        subtitle={strong.subtitle}
        icon={<HandThumbUpIcon />}
        color="emerald" 
      />

    </div>
  );
}