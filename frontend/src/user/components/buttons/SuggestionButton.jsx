
const SuggestionButton = ({ onClick }) => { 
  return (
    <button 
      onClick={onClick} 
      className="bg-blue-500 hover:bg-blue-600 active:scale-95 transition-transform text-white font-bold py-4 px-12 text-2xl rounded-2xl shadow-lg border-b-4 border-blue-700 select-none touch-manipulation">
      Dejar Sugerencia
    </button>
  );
};

export default SuggestionButton;