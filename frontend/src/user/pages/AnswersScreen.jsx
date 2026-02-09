import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import api from "../../admin/services/api";

import good from "../../assets/icons/haha.json";
import excellent from "../../assets/icons/love.json";
import regular from "../../assets/icons/meh.json";
import bad from "../../assets/icons/angry.json";
import hands from "../../assets/icons/hands.json";

const opcionesEmoji = [
  { label: "Excelente", anim: excellent, value: 4 },
  { label: "Bueno", anim: good, value: 3 },
  { label: "Puede mejorar", anim: regular, value: 2 },
  { label: "Malo", anim: bad, value: 1 },
];

const preguntas = [
  { id: 1, texto: "¿Qué le pareció el servicio de su mesero?" },
  { id: 2, texto: "¿La calidad de sus bebidas fue la que esperaba?" },
  { id: 3, texto: "¿Los alimentos servidos cumplieron sus expectativas?" },
  { id: 4, texto: "¿Nuestras instalaciones estuvieron a la altura de su visita?" }
];

export default function AnswersScreen() {
  const [paso, setPaso] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const manejarRespuesta = async (value) => {
    if (enviando) return;
    setEnviando(true);

    const preguntaActual = preguntas[paso];

    try {
      await api.post("/reactions", {
        question_id: preguntaActual.id,
        value: value,
      });

      if (paso < preguntas.length - 1) {
        setPaso(paso + 1);
      } else {
        setTerminado(true);
      }

    } catch (error) {
      console.error("Error enviando reacción:", error);
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    if (terminado) {
      const timer = setTimeout(() => {
        setPaso(0);
        setTerminado(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [terminado]);

  /* =============================
     PANTALLA GRACIAS
  ==============================*/
  if (terminado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-white">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-600 mb-6">
          ¡Gracias por tu opinión!
        </h2>

        <Lottie animationData={hands} loop className="w-48 sm:w-60 md:w-72"/>

        <p className="text-gray-800 font-medium text-lg sm:text-xl mt-6">
          Sus comentarios son muy importantes para nosotros 💜
        </p>
      </div>
    );
  }

  const preguntaActual = preguntas[paso];

  /* =============================
     SCREEN PRINCIPAL
  ==============================*/
  return (
    <div className="
      flex flex-col items-center justify-center 
      min-h-screen bg-gray-100
      px-6 py-10
    ">

      {/* PREGUNTA */}
      <h1 className="
        text-center font-bold text-indigo-900
        text-2xl sm:text-3xl md:text-4xl lg:text-5xl
        max-w-4xl leading-tight
      ">
        {preguntaActual.texto}
      </h1>

      {/* BOTONES */}
      <div className="
        grid 
        grid-cols-2 
        md:grid-cols-4 
        gap-8 sm:gap-10 md:gap-14 
        mt-12 md:mt-16
        w-full max-w-5xl
        place-items-center
      ">
        {opcionesEmoji.map((opcion, index) => (
          <button
            key={index}
            disabled={enviando}
            onClick={() => manejarRespuesta(opcion.value)}
            className="
              flex flex-col items-center justify-center 
              transition transform active:scale-95
              disabled:opacity-40
            "
          >
            <Lottie 
              animationData={opcion.anim} 
              loop 
              className="
                w-24 h-24 
                sm:w-28 sm:h-28 
                md:w-36 md:h-36 
                lg:w-36 lg:h-36
              "
            />

            <span className="
              mt-3 text-center font-semibold text-indigo-900
              text-sm sm:text-lg md:text-2xl
            ">
              {opcion.label}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
}
