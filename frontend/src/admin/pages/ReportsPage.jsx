import React from 'react';
import SuggestionsReportCard from "../components/reports/SuggestionsReportCard";
import TrendReportCard from '../components/reports/TrendReportCard';
import ShiftReportCard from '../components/reports/ShiftReportCard';
import PageHeader from '../components/ui/Pageheader';

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
          <ShiftReportCard />
        </div>

      </div>
    </div>
  );
}