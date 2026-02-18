
export default function SuggestionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        mt-8 px-8 py-3 
        bg-white border-2 border-indigo-400 text-indigo-600 
        font-bold rounded-xl text-lg
        hover:bg-green-50 transition-all duration-300
        active:scale-95 shadow-sm
      "
    >
      Escribir Sugerencia
    </button>
  );
}