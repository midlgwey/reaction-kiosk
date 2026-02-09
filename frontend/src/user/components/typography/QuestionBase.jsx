
export default function QuestionBase({ titulo, children }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6 text-center">
      
      {/* TÍTULO DE LA PREGUNTA */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10 max-w-2xl">
        {titulo}
      </h2>

      {/* AQUÍ VAN LAS OPCIONES (EmojiPanel) */}
      <div className="w-full max-w-4xl">
        {children}
      </div>

    </div>
  );
}