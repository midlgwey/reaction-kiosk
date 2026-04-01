import React from 'react';
import { ChatBubbleLeftRightIcon, StarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRecentAlerts } from '../../hooks/alerts/useRecentAlerts';

export default function RecentAlerts() {
  const { alerts, loading } = useRecentAlerts();

  const getAlertStyles = (type) => {
    if (type === 'rating') {
      return {
        wrapper: 'bg-rose-50 border-rose-200 hover:shadow-md',
        iconBg: 'bg-rose-100 text-rose-600',
        label: 'text-rose-800',
        icon: <StarIcon className="w-5 h-5" />,
      };
    }
    return {
      wrapper: 'bg-amber-50 border-amber-200 hover:shadow-md',
      iconBg: 'bg-amber-100 text-amber-600',
      label: 'text-amber-800',
      icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col w-full h-full overflow-hidden">

      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
            Alertas Críticas de Hoy
          </h3>
        </div>
        {!loading && (
          <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
            {alerts.length} {alerts.length === 1 ? 'Alerta' : 'Alertas'}
          </span>
        )}
      </div>

      {/* Lista */}
        <div className="divide-y divide-slate-50 overflow-y-auto max-h-[420px]">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-slate-100 rounded-2xl"></div>
            <div className="h-20 bg-slate-100 rounded-2xl"></div>
            <div className="h-20 bg-slate-100 rounded-2xl"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <span className="text-4xl mb-3">✅</span>
            <p className="font-medium text-sm">Todo en orden.</p>
            <p className="text-xs">No hay alertas críticas hoy.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map((alert, index) => {
              const styles = getAlertStyles(alert.type);
              return (
                <div
                  key={index}
                  className={`flex gap-4 p-4 rounded-2xl border transition-all ${styles.wrapper}`}
                >
                  {/* Icono */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg}`}>
                    {styles.icon}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold text-sm ${styles.label}`}>
                        {alert.type === 'comment' ? 'Comentario negativo' : 'Baja calificación'}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/60 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {new Date(alert.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        {' · '}
                        {new Date(alert.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {alert.type === 'comment'
                        ? `"${alert.message}"`
                        : `Mal puntaje en: ${alert.message}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}