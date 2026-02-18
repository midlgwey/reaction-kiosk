import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 pt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-indigo-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
      </button>
      
      <span className="text-sm font-medium text-slate-600">
        Página <span className="text-indigo-600 font-bold">{currentPage}</span> de {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-indigo-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronRightIcon className="w-5 h-5 text-slate-600" />
      </button>
    </div>
  );
}