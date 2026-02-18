import Lottie from "lottie-react";

export default function ReactionButton({ emoji, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        group relative flex flex-col items-center justify-center
        bg-white               /* Fondo Blanco */
        rounded-3xl               /* Bordes redondeados */
        w-full aspect-square       /* Mantiene proporción cuadrada perfecta */
        p-4                        /* Espacio interno */
        transition-all duration-300 ease-out
        transform hover:-translate-y-1 hover:scale-105 /* Efecto de 'levantarse' */
        border border-transparent hover:border-indigo-200 /* Borde sutil al hover */
      "
    >

      {/* Contenedor del Lottie para controlar tamaño interno */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
         <Lottie animationData={emoji} loop={true} />
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