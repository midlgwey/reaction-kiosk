import React from 'react';
import { ChatBubbleLeftRightIcon, StarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRecentAlerts } from '../../hooks/useRecentAlerts'; 

export default function RecentAlerts() {
  // Ahora el componente obtiene su propia data
  const { alerts, loading } = useRecentAlerts(); 

  if (loading) return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 animate-pulse space-y-4">
            <div className="h-6 bg-slate-100 rounded w-1/2"></div>
            <div className="h-20 bg-slate-50 rounded"></div>
            <div className="h-20 bg-slate-50 rounded"></div>
        </div>
    </div>
  );

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-rose-50/30">
        <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-tighter">
          <ExclamationTriangleIcon className="w-5 h-5 text-rose-500" />
          Alertas Críticas (Últimas 5)
        </h3>
      </div>

      <div className="divide-y divide-slate-100">
        {alerts.length === 0 ? (
          <p className="p-10 text-center text-slate-400 text-sm italic">Sin alertas recientes. ¡Todo marcha bien!</p>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
              <div className={`mt-1 p-2 rounded-xl shrink-0 ${
                alert.type === 'comment' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {alert.type === 'comment' ? <ChatBubbleLeftRightIcon className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                   {new Date(alert.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} • {alert.type === 'comment' ? 'Comentario' : 'Baja Calificación'}
                </span>
                <p className="text-sm text-slate-700 font-medium leading-snug">
                  {alert.type === 'comment' ? `"${alert.content}"` : `Mal puntaje en: ${alert.content}`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}