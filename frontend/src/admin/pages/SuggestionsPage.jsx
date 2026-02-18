import React from 'react'; 
import { useSuggestionsList } from '../hooks/feedback/useSuggestionsList';
import { useSuggestionsPagination } from '../hooks/feedback/useSuggestionsPagination';

// Componentes de Presentación
import SuggestionsHeader from '../components/suggestions/SuggestionsHeader';
import SuggestionsTable from '../components/suggestions/SuggestionsTable';
import Pagination from '../components/suggestions/Pagination';
import FeedbackStats from '../components/metrics/StatCardSuggestions';

/**
 * Componente de Página: Gestión de Sugerencias (Feedback).
 * * Responsabilidades:
 * 1. Orquestación de estado de datos (lista de comentarios).
 * 2. Gestión de estado de UI (paginación y búsqueda).
 * 3. Composición de vistas de métricas y tablas de datos.
 */
export default function SuggestionsPage() {

  // Hook de Datos: Obtención y recarga de comentarios desde el backend.
  const { comments, loading, refresh } = useSuggestionsList();

  // Hook de Lógica de UI: Gestión de paginación y filtrado local.
  const { 
    searchTerm, 
    handleSearch, 
    currentData, 
    currentPage, 
    totalPages, 
    setCurrentPage 
  } = useSuggestionsPagination(comments, 10); 

  return (
    // Contenedor Raíz:
    // - Se elimina el padding (p-6) ya que es inyectado por el AdminLayout.
    // - Se mantiene 'space-y-6' para el espaciado vertical uniforme entre componentes.
    <div className="space-y-6 font-sans">
      
      {/* Sección de Métricas (KPIs): Resumen estadístico diario */}
       <FeedbackStats />

       {/* Barra de Herramientas: Controles de búsqueda y actualización */}
      <SuggestionsHeader 
        searchTerm={searchTerm} 
        onSearch={handleSearch} 
        onRefresh={refresh} 
        loading={loading} 
      />

      {/* Visualización de Datos: Tabla renderizada con el subset de datos actual */}
      <SuggestionsTable 
        data={currentData} 
        loading={loading} 
      />

      {/* Controles de Navegación: Paginación del dataset */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

    </div>
  );
}