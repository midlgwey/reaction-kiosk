import React from 'react';

import SuggestionsReportCard from "../components/reports/SuggestionsReportCard";
import TrendReportCard from '../components/reports/TrendReportCard';
import ShiftReportCard from '../components/reports/ShiftReportCard';
import QuestionsReportCard from '../components/reports/QuestionsReportCard';


export default function ReportsPage() {
  return (
    <div className="space-y-6">
      
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">Centro de Descargas</h1>
        <p className="text-slate-500 text-lg">
           Exporta la información histórica del restaurante.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
        
        <SuggestionsReportCard />

        <TrendReportCard/> 

        <ShiftReportCard/>

        <QuestionsReportCard/>

  
      </div>
    </div>
  );
}