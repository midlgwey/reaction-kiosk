import React from 'react';
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function StaffResetButton({ onReset }) {
  return (
    <button
      onClick={onReset}
      className="
        fixed bottom-6 right-6            
        flex items-center gap-2 
        px-4 py-2 
        bg-gray-100 hover:bg-gray-200 active:bg-indigo-100
        text-gray-400 hover:text-indigo-600 
        rounded-full border border-gray-200
        transition-all duration-300
        text-xs font-bold tracking-widest uppercase
        shadow-sm hover:shadow-md
        z-50                             
      "
    >
      <ArrowPathIcon className="w-4 h-4" />
      <span>Nueva Mesa</span>
    </button>
  );
}