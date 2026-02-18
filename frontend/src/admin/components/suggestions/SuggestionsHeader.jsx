import React from 'react';
import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SuggestionsHeader({ searchTerm, onSearch, onRefresh, loading }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight border-l-4 border-indigo-600 pl-4 w-full md:w-auto">
        Opinión del Comensal
      </h1>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative w-full md:w-auto">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar comentarios..." 
            value={searchTerm}
            onChange={onSearch}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-indigo-500 transition-all outline-none shadow-sm"
          />
        </div>
        
        <button 
          onClick={onRefresh}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95 whitespace-nowrap"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Actualizar</span>
        </button>
      </div>
    </div>
  );
}