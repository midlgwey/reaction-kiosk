import { useState, useMemo } from 'react';

export function useSuggestionsPagination(comments, itemsPerPage = 10) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrado
  const filteredComments = useMemo(() => {

    // Si no hay comentarios, retornamos vacío para evitar errores
    if (!comments) return [];

     const lowerSearch = searchTerm.toLowerCase();
    
    return comments.filter(item => 
      (item.comment || "").toLowerCase().includes(lowerSearch) ||
      (item.shift || "").toLowerCase().includes(lowerSearch) ||
      (item.mesero || "").toLowerCase().includes(lowerSearch) ||
      (item.table_number?.toString() || "").includes(lowerSearch)
    );
  }, [comments, searchTerm]);

  // Cálculo de Páginas
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);

  // Recorte de Datos (La página actual)
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredComments.slice(start, start + itemsPerPage);
  }, [filteredComments, currentPage, itemsPerPage]);

  // Manejador del Input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Importante: Resetear a pág 1 al buscar
  };

  return {
    searchTerm,
    currentPage,
    currentData,
    totalPages,
    setCurrentPage,
    handleSearch
  };
}