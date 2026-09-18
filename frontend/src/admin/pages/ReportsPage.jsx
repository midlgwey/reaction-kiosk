import React from 'react';
import SuggestionsReportCard from "../components/reports/SuggestionsReportCard";
import TrendReportCard from '../components/reports/TrendReportCard';
/**
 * PageHeader - Componente reutilizable para encabezados
 */
function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight border-l-4 border-indigo-600 pl-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm mt-2 text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}


export default function ReportsPage() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Encabezado */}
        <PageHeader 
          title="Centro de Descargas" 
          subtitle="Exporta la información histórica del restaurante."
        />

        {/* Grid de reportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <SuggestionsReportCard />
          <TrendReportCard />

        </div>

      </div>
    </div>
  );
}