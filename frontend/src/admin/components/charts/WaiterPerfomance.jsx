import React, { useState } from 'react';

// Datos simulados: 32 encuestas por mesero = 32 respuestas por cada pregunta
const MOCK_PERFORMANCE_DATA = {
  'luis-p': {
    name: 'Luis P.',
    totalEncuestas: 32,
    preguntas: [
      { id: 1, label: '¿Qué le pareció el servicio de su mesero?',     respuestas: { excelente: 24, bueno: 5,  regular: 2,  malo: 1 } },
      { id: 2, label: '¿La calidad de sus bebidas fue la que esperaba?',      respuestas: { excelente: 4,  bueno: 8,  regular: 12, malo: 8 } }, // Aquí está su problema real
      { id: 3, label: '¿Los alimentos servidos cumplieron sus expectativas?',  respuestas: { excelente: 20, bueno: 10, regular: 2,  malo: 0 } },
      { id: 4, label: '¿Nuestras instalaciones estuvieron a la altura de su visita?',       respuestas: { excelente: 28, bueno: 3,  regular: 1,  malo: 0 } },
    ]
  },
  'ana-g': {
    name: 'Ana G.',
    totalEncuestas: 40,
    preguntas: [
      { id: 1, label: '¿Qué le pareció el servicio de su mesero?',     respuestas: { excelente: 35, bueno: 5,  regular: 0,  malo: 0 } },
      { id: 2, label: '¿La calidad de sus bebidas fue la que esperaba?',      respuestas: { excelente: 30, bueno: 8,  regular: 2,  malo: 0 } },
      { id: 3, label: '¿Los alimentos servidos cumplieron sus expectativas?',  respuestas: { excelente: 38, bueno: 2,  regular: 0,  malo: 0 } },
      { id: 4, label: '¿Nuestras instalaciones estuvieron a la altura de su visita?',       respuestas: { excelente: 36, bueno: 4,  regular: 0,  malo: 0 } },
    ]
  }
};

export default function WaiterPerformance() {
  const [selectedWaiterId, setSelectedWaiterId] = useState('luis-p');
  
  const currentData = MOCK_PERFORMANCE_DATA[selectedWaiterId];

  // Helper para calcular porcentajes y que la barra ocupe el espacio correcto
  const getPercentage = (value, total) => `${(value / total) * 100}%`;

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
            Radiografía por Pregunta
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Análisis detallado de las 4 preguntas de la encuesta por dia.
          </p>
        </div>
        
    
      </div>

      {/* Leyenda de Colores */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Excelente</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-400"></span> Bueno</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Puede Mejorar</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400"></span> Malo</div>
      </div>

      {/* Gráficas de Barras Apiladas por Pregunta */}
      <div className="space-y-6">
        {currentData.preguntas.map((q) => (
          <div key={q.id} className="flex flex-col gap-2">
            
            {/* Título de la pregunta y contador total */}
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-slate-700">{q.label}</span>
              <span className="text-xs text-slate-400 font-medium">{currentData.totalEncuestas} respuestas</span>
            </div>

            {/* Barra Apilada Visual */}
            <div className="h-6 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner border border-slate-200/60">
              
              {/* Bloque Excelente (Verde) */}
              {q.respuestas.excelente > 0 && (
                <div 
                  className="bg-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-900 transition-all duration-500"
                  style={{ width: getPercentage(q.respuestas.excelente, currentData.totalEncuestas) }}
                  title={`${q.respuestas.excelente} Excelente`}
                >
                  {q.respuestas.excelente > (currentData.totalEncuestas * 0.05) ? q.respuestas.excelente : ''}
                </div>
              )}

              {/* Bloque Bueno (Azul/Morado) */}
              {q.respuestas.bueno > 0 && (
                <div 
                  className="bg-indigo-400 flex items-center justify-center text-[10px] font-bold text-indigo-900 transition-all duration-500"
                  style={{ width: getPercentage(q.respuestas.bueno, currentData.totalEncuestas) }}
                  title={`${q.respuestas.bueno} Bueno`}
                >
                  {q.respuestas.bueno > (currentData.totalEncuestas * 0.05) ? q.respuestas.bueno : ''}
                </div>
              )}

              {/* Bloque Regular (Amarillo/Naranja) */}
              {q.respuestas.regular > 0 && (
                <div 
                  className="bg-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-900 transition-all duration-500"
                  style={{ width: getPercentage(q.respuestas.regular, currentData.totalEncuestas) }}
                  title={`${q.respuestas.regular} Puede Mejorar`}
                >
                  {q.respuestas.regular > (currentData.totalEncuestas * 0.05) ? q.respuestas.regular : ''}
                </div>
              )}

              {/* Bloque Malo (Rojo) */}
              {q.respuestas.malo > 0 && (
                <div 
                  className="bg-rose-400 flex items-center justify-center text-[10px] font-bold text-rose-900 transition-all duration-500"
                  style={{ width: getPercentage(q.respuestas.malo, currentData.totalEncuestas) }}
                  title={`${q.respuestas.malo} Malo`}
                >
                  {q.respuestas.malo > (currentData.totalEncuestas * 0.05) ? q.respuestas.malo : ''}
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}