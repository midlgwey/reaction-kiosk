import { useSuggestions } from '../../hooks/useSuggestions.js';
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function SuggestionCard({ ratingActual, onFinish, onCancel }) {
  
  const { text, setText, loading, handleSend } = useSuggestions(
    ratingActual,
    onFinish, 
    () => alert("Hubo un error al enviar, intente nuevamente.") 
  );

  /**
   * Valida la calidad del comentario antes de permitir el envío.
   * Ajustado para aceptar frases cortas reales y bloquear spam evidente.
   */
  const esTextoValido = () => {
    const t = text.trim();
    
    // Longitud mínima muy permisiva
    if (t.length < 6) return false;

    // Filtra repetición excesiva de cualquier carácter (ej. "aaaaaaa", "///////").
    // Aumentado a 5 para tolerar dedos lentos en la tablet
    if (/(.)\1{4,}/.test(t)) return false;

    // Valida la presencia de al menos un espacio. Esto permite frases cortas pero reales, y bloquea palabras únicas sin sentido.
    if (!t.includes(' ')) return false;

    // Exige al menos una letra del abecedario (bloquea "12345 6789" o "//// ////").
    const contieneLetras = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(t);
    if (!contieneLetras) return false;

    // Detecta "teclazos" sin sentido de consonantes (ej. "sjsjdajdsajd" o "qwrty psdfg")
    // Si hay más de 5 consonantes seguidas sin vocales, lo asume como basura.
    const tecladoRandom = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}/;
    if (tecladoRandom.test(t)) return false;

    return true;
  };

  /**
   * Manejador de eventos del teclado para dispositivos móviles y tablets.
   * Previene el salto de línea y ejecuta la acción de envío al presionar 'Enter'
   * siempre que se cumplan los criterios de validación.
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      
      if (esTextoValido() && !loading) {
        e.target.blur(); // Oculta el teclado virtual nativo
        handleSend();    // Ejecuta el proceso de guardado
      }
    }
  };

  return (
    // Estructura de altura dinámica para mantener la visibilidad de controles sobre el teclado táctil.
    <div className="bg-indigo-50 rounded-[2.5rem] shadow-2xl p-8 md:p-12 w-full max-w-2xl mx-auto border border-slate-100 relative animate-scale-in flex flex-col h-[80vh] md:h-auto max-h-[700px]">
      
      {/* Control de cierre superior */}
      <button 
        onClick={onCancel}
        className="absolute top-6 right-6 p-3 bg-rose-200 rounded-full text-red-600 hover:bg-rose-300 transition-colors active:scale-95 z-10"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>

      {/* Encabezado del componente */}
      <div className="mb-6 md:mb-8 mt-4 md:mt-0">
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 md:mb-3">
          Nos interesa tu opinión
        </h3>
        <p className="text-slate-600 text-lg md:text-xl font-medium">
          Ayúdanos a mejorar contándonos tu experiencia.
        </p>
      </div>
      
      {/* Área de captura de texto */}
      <textarea
        className="
          w-full 
          flex-grow        
          bg-slate-50        
          border-2 border-slate-200 
          rounded-2xl 
          p-6 
          text-xl md:text-2xl text-slate-700 
          placeholder:text-slate-400
          focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none 
          resize-none      
          transition-all
          shadow-inner
          mb-2
        "
        placeholder="Escriba su sugerencia, queja o felicitación aquí..."
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        disabled={loading}
        autoFocus 
        enterKeyHint="send" 
        onKeyDown={handleKeyDown} 
      />

      {/* Indicador de ayuda visual para el usuario */}
      <div className="mb-4 ml-2 h-6">
        {!esTextoValido() && text.length > 0 && (
          <p className="text-sm font-bold text-red-500">
            {text.length < 6 ? "Escribe un poco más..." : "Por favor, escribe un comentario válido."}
          </p>
        )}
      </div>

      {/* Controles de acción inferiores */}
      <div className="flex gap-4 mt-auto">
        
        {/* Acción secundaria: Cancelar */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="
            flex-1 py-4 
            text-slate-600 font-bold text-xl
            bg-white border-2 border-slate-400 rounded-2xl
            hover:bg-rose-100 hover:border-rose-300 hover:text-red-500
            transition-colors
          "
        >
          Cancelar
        </button>

        {/* Acción principal: Enviar Comentario */}
        <button
          onClick={handleSend}
          disabled={loading || !esTextoValido()}
          className={`
            flex-1 py-4 rounded-2xl font-bold text-xl text-white shadow-xl transition-all flex items-center justify-center gap-3
            ${loading || !esTextoValido()
              ? 'bg-indigo-300 cursor-not-allowed shadow-none opacity-70' 
              : 'bg-indigo-500 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-1 active:translate-y-0'}
          `}
        >
          {loading ? (
             <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Enviar Comentario</span>
              <PaperAirplaneIcon className="w-6 h-6" />
            </>
          )}
        </button>
       
      </div>
    </div>
  );
}