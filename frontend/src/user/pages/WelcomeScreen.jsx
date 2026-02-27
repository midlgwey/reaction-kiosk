import logodife from "../../assets/logo/logodife.png";


export default function WelcomeScreen({ onStart }) {
  return (
    <div 
      onClick={onStart}
      className="min-h-[100dvh] bg-gradient-to-br from-[#F4F6FB] to-[#c6b8d6] flex flex-col items-center justify-center cursor-pointer select-none"
    >
      <div className="flex flex-col items-center">
      
        <img 
          src={logodife} 
          alt="La Diferencia Logo" 
          className="w-72 sm:w-80 md:w-96 object-contain" 
        />
        <div className="bg-white px-8 py-4 rounded-full shadow-lg text-indigo-900 font-bold text-xl md:text-2xl flex items-center">
          <span>👆</span>
          <span>Toca la pantalla para iniciar</span>
        </div>

      </div>
    </div>
  );
}