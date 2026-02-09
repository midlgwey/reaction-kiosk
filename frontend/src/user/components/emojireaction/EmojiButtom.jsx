import Lottie from "lottie-react";

export default function EmojiButton({ emoji, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full transition-transform">
    
      <Lottie animationData={emoji} loop className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"/>

      <span className="mt-2 text-sm sm:text-base md:text-lg font-medium text-gray-900 text-center leading-tight">
        {label}
      </span>
      
    </button>
  );
}
