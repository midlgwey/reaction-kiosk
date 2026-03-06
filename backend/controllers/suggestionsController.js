import { db } from "../db.js";
import { getShiftByTime } from '../utils/shiftUtils.js'; 
import { InternalServerError } from '../errors/customErrors.js'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendAlertTelegram } from '../utils/alertsUtils.js';

// Ajuste de hora para Tijuana (Invierno: -8, Verano: -7)
const TIME_OFFSET = '-8 hours';

// Inicializar Gemini con tu API Key (Usamos el modelo que SI te funcionó)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// --- GUARDAR SUGERENCIA (Modo Rápido / Fire and Forget) ---
export const createSuggestion = async (req, res) => {
  try {
    const { comment, rating_context } = req.body;
    const shift = getShiftByTime();

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ error: "Comentario vacío" });
    }

    const result = await db.execute({
      sql: `INSERT INTO suggestions (comment, rating_context, shift, sentiment) VALUES (?, ?, ?, ?)`,
      args: [comment.trim(), rating_context || null, shift, 'Neutral'],
    });

    const newId = result.lastInsertRowid; 

    res.status(201).json({ 
      success: true, 
      message: "Sugerencia recibida", 
      sentiment: "Procesando..." 
    });

    // Esto ocurre despues de responder
    analyzeSentimentInBackground(newId, comment.trim());

  } catch (error) {
    console.error("Error:", error);
    if (!res.headersSent) res.status(500).json({ error: "Error" });
  }
};

const complaintConnectors = [
  "pero",
  "solo que",
  "aunque",
  "excepto",
  "nada mas que",
  "nada más que",
  "lo unico",
  "lo único",
];

//Extrae la parte del comentario que sigue después de conectores de contraste
function extractComplaintSegment(text) {
  const lower = text.toLowerCase();

  for (const connector of complaintConnectors) {
    const index = lower.indexOf(connector);

    if (index !== -1) {
      return lower.slice(index + connector.length).trim();
    }
  }

  return null;

}

// Normaliza el texto para evitar problemas con acentos o variaciones de escritura
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD") // separa letras de acentos
    .replace(/[\u0300-\u036f]/g, ""); // elimina los acentos
}

// Se ejecuta en el servidor, no en el kiosko
async function analyzeSentimentInBackground(id, commentText) {
  try {
    // Preguntar a Gemini, mi prompt
    const prompt = `Analiza el sentimiento de este comentario para un restaurante de comida mexicana en Tijuana, Mexico. 
      Responde ÚNICAMENTE con una de estas tres palabras: "Positive", "Negative" o "Neutral".
      Considera que el cliente puede tener mala ortografía y ser una persona mayor (40-60+ años).
      Comentario: "${commentText}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    console.log(`[ID: ${id}] IA terminó análisis: ${responseText}`);

    // Si la respuesta es válida, se actuualiza el registro
    if (["Positive", "Negative", "Neutral"].includes(responseText) && responseText !== 'Neutral') {
       await db.execute({
         sql: `UPDATE suggestions SET sentiment = ? WHERE id = ?`,
         args: [responseText, BigInt(id)] // Usamos BigInt por si el ID es muy grande
       });
       console.log(`[ID: ${id}] Base de datos actualizada con éxito.`);
    }

  
    // Se normaliza el texto para mejorar la detección de palabras clave
    const lowerCaseText = normalizeText(commentText);

    // Extraemos la parte del comentario que podría contener la queja, para hacer un análisis más profundo de palabras clave críticas
    const complaintSegment = extractComplaintSegment(commentText);
    
    // Diccionario de palabras rojas operativas
    const criticalKeywords = [
      // Servicio / Actitud
      'grosero', 'mal trato', 'de malas', 'sin ganas', 'actitud', 'prepotente', 'ignoraron', "tardo en atender", "no me atendieron", "me dejaron esperando", "sin atender", "desatendieron", "distraido",
      // Comida / Plagas (Urgencia máxima)
      'pelo', 'cabello', 'insecto', 'mosca', 'cucaracha', 'bicho', 'crudo', 'quemado', 'frío', 'fria', 'tardo', 'tardaron', 'basura', 'no fue lo que pedi', 'no fue lo que pedí', 'sin sabor', "echado a perder", "incomible", "asqueroso", "repugnante", "apestoso",
      // Bebidas / Comida (Errores operativos)
      'fría', 'fria', 'tardo', 'tardaron', 'basura', 'no fue lo que pedi', 'no fue lo que pedí', 'sin sabor' , "apestaba el vaso", "sabe a agua", "sabe a nada", "sabe raro", "sabe mal", "no sabe bien",
      // Instalaciones
      'sucio', 'sucia', 'deplorable', 'sin papel', 'sin agua', 'apesta', 'hediondo', 'olor a baño', 'olor a pis', 'olor a orines', 'olor a humedad', 'olor a moho', 'olor a muerto', 'olor a basura', 'inodoro', 'baño público', "baño apestoso", "baño sucio", "baño asqueroso", 
      'sin papel', 'no habia papel', 'no había papel', 'baño sucio', 'baño apestoso', 'no habia agua', 'no había agua', 'falta papel', 'falta servilletas',
    ];
    
    // Para detectar quejas ocultas, analizamos el texto completo y también la parte que suele contener la queja (después de conectores como "pero" o "aunque")
    const textToAnalyze = complaintSegment 
      ? normalizeText(complaintSegment) 
      : lowerCaseText;

      const isHiddenComplaint = criticalKeywords.some(keyword =>
        textToAnalyze.includes(keyword)
      );

    // Disparamos la alerta si es negativo puro O si es una queja oculta
    if (responseText === 'Negative' || isHiddenComplaint) {
       const alertReason = isHiddenComplaint ? "Queja operativa detectada" : "Comentario Negativo";
       const alertMessage = 
        `🔴 Alerta de Crítica
        Turno: ${getShiftByTime()}
        Motivo: ${alertReason}

        Comentario:
        "${commentText}"`;
       
       // Guardar en la tabla alerts (para la campana del Dashboard)
       await db.execute({
         sql: `INSERT INTO alerts (type, message, suggestion_id) VALUES (?, ?, ?)`,
         args: ['critica', alertMessage, Number(id)] // Aquí usamos el ID de la sugerencia
       });

       // Enviar al celular
       await sendAlertTelegram(alertMessage);
    }

  } catch (aiError) {
    // Si falla, solo lo anotamos en la consola. El usuario no se entera y el registro queda 'Neutral'.
    console.error(`[ID: ${id}] Error en proceso de fondo IA:`, aiError);
  }
}

export const getSuggestions = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          id, 
          comment, 
          rating_context, 
          shift, 
          sentiment,
          datetime(created_at, '${TIME_OFFSET}') as date
        FROM suggestions
        ORDER BY created_at DESC
        LIMIT 200
      `
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getSuggestions:", error);
    throw new InternalServerError("Error al obtener sugerencias");
  }
};

//cards de feedback
export const getFeedbackStats = async (req, res) => {
  try {
    // Recolectar datos del día ajustados a la hora de Tijuana
    const result = await db.execute({
      sql: `
        SELECT shift, sentiment, comment
        FROM suggestions
        WHERE date(datetime(created_at, ?)) = date('now', ?)
      `,
      args: [TIME_OFFSET, TIME_OFFSET] 
    });
    
    const todayRows = result.rows;
    const total = todayRows.length;

    // Si no hay nada hoy, regresamos valores iniciales limpios
    if (total === 0) {
      return res.json({
        total: 0,
        criticalShift: "Sin datos",
        mainComplaint: "Todo tranquilo",
        strongPoint: "Esperando..."
      });
    }

    // Filtramos por bando para los cálculos
    const negatives = todayRows.filter(r => r.sentiment === 'Negative');
    const positives = todayRows.filter(r => r.sentiment === 'Positive');

    // TURNO CRÍTICO 
    let criticalShift = "Todo bien";
    if (negatives.length > 0) {
      const shiftCounts = {};
      negatives.forEach(r => {
        const s = r.shift || "General";
        shiftCounts[s] = (shiftCounts[s] || 0) + 1;
      });
      // Sacamos el turno que tiene más quejas acumuladas
      criticalShift = Object.keys(shiftCounts).reduce((a, b) => shiftCounts[a] > shiftCounts[b] ? a : b);
    }

    // DETECTOR DE TEMAS (Clasificación por categorías y detección de adjetivos frecuentes)
    const detectTopic = (commentsList) => {
      let counts = { 'servicio': 0, 'comida': 0, 'bebida': 0, 'instalacion': 0, 'general': 0 };
      let wordCounts = {};
      
      const specificWords = {
        'fria': 'Fría', 'fría': 'Fría',
        'sin sabor': 'Sin sabor', 'desabrida': 'Sin sabor',
        'caro': 'Caro', 'precio': 'Caro', 'cobro': 'Cobro',
        'lento': 'Lento', 'tarda': 'Lento', 'espera': 'Lento',
        'grosero': 'Grosero', 'mal trato': 'Mal trato', 'actitud': 'Mala actitud',
        'pelo': 'Cabello/Pelo', 'mosca': 'Plaga', 'sucio': 'Sucio', 'bano': 'Baño', 'baño': 'Baño',
        'rico': 'Rico', 'delicioso': 'Delicioso', 'excelente': 'Excelente', 
        'amable': 'Amable', 'rapido': 'Rápido', 'rápido': 'Rápido', 'perfecto': 'Perfecto'
      };

      commentsList.forEach(item => {
        const text = (item.comment || "").toLowerCase();
        
        // Conteo de categorías
        if (text.includes('mesero') || text.includes('host') || text.includes('lento') || text.includes('mal trato') || text.includes('grosero') || text.includes('rapido') || text.includes('rápido') || text.includes('de malas') || text.includes('amable') || text.includes('atencion') || text.includes('atención')) counts['servicio']++;
        if (text.includes('comida') || text.includes('plato') || text.includes('fria') || text.includes('fría') || text.includes('sin sabor') || text.includes('pelo') || text.includes('cabello') || text.includes('insecto') || text.includes('mosca') || text.includes('crudo') || text.includes('rico') || text.includes('rica') || text.includes('delicioso')) counts['comida']++;
        if (text.includes('bebida') || text.includes('vaso') || text.includes('cafe') || text.includes('refresco') || text.includes('cerveza') || text.includes('caro') || text.includes('precio') || text.includes('tibia')) counts['bebida']++;
        if (text.includes('instalacion') || text.includes('sucio') || text.includes('deplorable') || text.includes('papel') || text.includes('bano') || text.includes('baño') || text.includes('limpieza') || text.includes('agua')) counts['instalacion']++;
        if (text.includes('todo bien') || text.includes('perfecto') || text.includes('excelente') || text.includes('sin quejas') || text.includes('muy bien')) counts['general']++;

        // Conteo de palabras específicas
        Object.keys(specificWords).forEach(key => {
          if (text.includes(key)) {
            const niceLabel = specificWords[key];
            wordCounts[niceLabel] = (wordCounts[niceLabel] || 0) + 1;
          }
        });
      });
      
      let maxCount = 0;
      for (const key in counts) {
        if (counts[key] > maxCount) maxCount = counts[key];
      }

      if (maxCount === 0) return "Sin comentarios específicos";

      const labels = { 
        'servicio': 'Servicio', 
        'comida': 'Comida', 
        'bebida': 'Bebidas', 
        'instalacion': 'Instalaciones',
        'general': 'Experiencia General' 
      };

      const winners = Object.keys(counts).filter(key => counts[key] === maxCount).map(key => labels[key]);
      const mainCategory = winners.join(' y ');

      // Obtener los 2 adjetivos más frecuentes
      const topWords = Object.keys(wordCounts)
        .sort((a, b) => wordCounts[b] - wordCounts[a])
        .slice(0, 2);

      return topWords.length > 0 ? `${mainCategory} (${topWords.join(' y ')})` : mainCategory;
    };

    // Foco Malo (Naranja) vs Punto Fuerte (Verde)
    const mainComplaint = negatives.length > 0 ? detectTopic(negatives) : "Ninguna";
    const strongPoint = positives.length > 0 ? detectTopic(positives) : "Ninguno";

    // Respuesta final para el Frontend
    res.json({
      total,           
      criticalShift,  
      mainComplaint,  
      strongPoint    
    });

  } catch (error) {
    console.error("Valió queso getFeedbackStats:", error);
    res.status(500).json({ error: "Error calculando estadísticas" });
  }
};