
export default function ReactionButton({ emoji, label, onClick }) {
  return (
 <button
      onClick={onClick}
      className="
        group relative flex flex-col items-center justify-center
        bg-slate-100          
        rounded-3xl              
        w-full aspect-square   
        p-4                
        transition-colors duration-300 ease-out
        border border-transparent hover:border-indigo-200 
      "
    >
       <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
        <img 
          src={emoji} 
          alt={label}
          className="w-full h-full object-contain"
        />
      </div>

      <span className="
        mt-4 
        text-xl font-bold text-gray-700 
        group-hover:text-indigo-600 transition-colors
        
        flex h-14 w-full items-center justify-center text-center leading-tight
      ">
        {label}
      </span>
      
    </button>
  );
}