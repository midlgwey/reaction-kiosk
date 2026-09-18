import React from 'react'; 
import { useSuggestionsList } from '../hooks/feedback/useSuggestionsList';
import { useSuggestionsPagination } from '../hooks/feedback/useSuggestionsPagination';

import SuggestionsHeader from '../components/suggestions/SuggestionsHeader';
import SuggestionsTable from '../components/suggestions/SuggestionsTable';
import Pagination from '../components/suggestions/Pagination';
import FeedbackStats from '../components/metrics/suggestionscards/StatCardSuggestions';

export default function SuggestionsPage() {
  const { comments, loading, refresh } = useSuggestionsList();

  const { 
    searchTerm, 
    handleSearch, 
    currentData, 
    currentPage, 
    totalPages, 
    setCurrentPage 
  } = useSuggestionsPagination(comments, 10); 

  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6 font-sans">
        
        {/* Sección de Métricas */}
        <FeedbackStats />

        {/* Barra de Herramientas */}
        <SuggestionsHeader 
          searchTerm={searchTerm} 
          onSearch={handleSearch} 
          onRefresh={refresh} 
          loading={loading} 
        />

        {/* Tabla de Datos */}
        <SuggestionsTable 
          data={currentData} 
          loading={loading} 
        />

        {/* Paginación */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

      </div>
    </div>
  );
}