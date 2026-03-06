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
    analyzeSentimentInBackground(newId, comment.trim(), shift);

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


// Proceso asíncrono para el análisis de sentimiento
async function analyzeSentimentInBackground(id, commentText, shift) {
  try {
    const prompt = `Analiza el sentimiento de este comentario para un restaurante de comida mexicana en Tijuana, Mexico. 
      Responde ÚNICAMENTE con una de estas tres palabras: "Positive", "Negative" o "Neutral".
      Considera que el cliente puede tener mala ortografía y ser una persona mayor (40-60+ años).
      Comentario: "${commentText}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    console.log(`[ID: ${id}] IA terminó análisis: ${responseText}`);

    const lowerCaseText = normalizeText(commentText);
    const complaintSegment = extractComplaintSegment(commentText);
    
    // Diccionario de incidencias operativas críticas
    const criticalKeywords = [
      'grosero','mal trato','de malas','sin ganas','actitud','prepotente','ignoraron',
      "tardo en atender","no me atendieron","me dejaron esperando","sin atender","desatendieron","distraido",
      'pelo','cabello','insecto','mosca','cucaracha','bicho','crudo','quemado',
      'frio','fria','tardo','tardaron','basura','no fue lo que pedi','sin sabor',
      "echado a perder","incomible","asqueroso","repugnante","apestoso",
      "apestaba el vaso","sabe a agua","sabe a nada","sabe raro","sabe mal","no sabe bien",
      'sucio','sucia','deplorable','sin papel','sin agua','apesta','hediondo',
      'olor a bano','olor a pis','olor a orines','olor a humedad','olor a moho',
      'olor a muerto','olor a basura','inodoro','bano publico',"bano apestoso","bano sucio","bano asqueroso",
      'no habia papel','falta papel', 'pape','falta servilletas'
    ];

    const textToAnalyze = complaintSegment ? normalizeText(complaintSegment) : lowerCaseText;

    const isHiddenComplaint = criticalKeywords.some(keyword => textToAnalyze.includes(keyword));

    let finalSentiment = responseText;
    if (isHiddenComplaint && responseText !== "Negative") {
      finalSentiment = "Review";
    }

    // Actualización del registro en la base de datos
    if (["Positive","Negative","Neutral","Review"].includes(finalSentiment)) {
      await db.execute({
        sql: `UPDATE suggestions SET sentiment = ? WHERE id = ?`,
        args: [finalSentiment, BigInt(id)]
      });
    }

    // Formateo y envío de la alerta vía Telegram
    if (finalSentiment === "Negative" || finalSentiment === "Review") {
       const alertReason = finalSentiment === "Review" ? "Queja mixta detectada" : "Comentario Negativo";
       const alertMessage = `🔴 *Alerta de Crítica*\n*Turno:* ${shift}\n*Motivo:* ${alertReason}\n\n*Comentario:*\n"${commentText}"`;
       
       await db.execute({
         sql: `INSERT INTO alerts (type, message, suggestion_id) VALUES (?, ?, ?)`,
         args: ['critica', alertMessage, Number(id)] 
       });

       await sendAlertTelegram(alertMessage);
    }

  } catch (aiError) {
    console.error(`[ID: ${id}] Error en proceso de fondo IA:`, aiError);
  }
}

// Obtención del historial reciente de sugerencias
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
    console.error("Error en getSuggestions:", error);
    throw new InternalServerError("Error al obtener sugerencias");
  }
};

// Generación de métricas diarias para el Dashboard
export const getFeedbackStats = async (req, res) => {
  try {
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

    // Retorno de valores por defecto si no hay registros en el día actual
    if (total === 0) {
      return res.json({
        total: 0,
        criticalShift: "Sin datos",
        mainComplaint: "Todo tranquilo",
        strongPoint: "Esperando..."
      });
    }

    const negatives = todayRows.filter(r => r.sentiment === 'Negative' || r.sentiment === 'Review');
    const positives = todayRows.filter(r => r.sentiment === 'Positive');

    // Cálculo del turno con mayor incidencia de quejas
    let criticalShift = "Todo bien";
    if (negatives.length > 0) {
      const shiftCounts = {};
      negatives.forEach(r => {
        const s = r.shift || "General";
        shiftCounts[s] = (shiftCounts[s] || 0) + 1;
      });
      criticalShift = Object.keys(shiftCounts).reduce((a, b) => shiftCounts[a] > shiftCounts[b] ? a : b);
    }

    // Clasificación de temas basada en la polaridad del comentario (Positivo/Negativo)
    const detectTopic = (commentsList, mode) => {
      let counts = { 'servicio': 0, 'comida': 0, 'bebida': 0, 'instalacion': 0, 'general': 0 };
      let wordCounts = {};
      
      commentsList.forEach(item => {
        const text = normalizeText(item.comment || "");
        
        if (mode === 'bad') {
          // Análisis de áreas de mejora
          if (text.includes('lento') || text.includes('mal trato') || text.includes('grosero') || text.includes('actitud')) counts['servicio']++;
          if (text.includes('fria') || text.includes('sin sabor') || text.includes('pelo') || text.includes('mosca') || text.includes('crudo')) counts['comida']++;
          if (text.includes('caro') || text.includes('tibia')) counts['bebida']++;
          if (text.includes('sucio') || text.includes('papel') || text.includes('bano') || text.includes('agua') || text.includes('olor')) counts['instalacion']++;

          const badWords = {
            'fria': 'Fría', 'sin sabor': 'Sin sabor', 'desabrida': 'Sin sabor',
            'caro': 'Caro', 'cobro': 'Cobro',
            'lento': 'Lento', 'tarda': 'Lento', 'espera': 'Lento',
            'grosero': 'Grosero', 'actitud': 'Mala actitud',
            'pelo': 'Cabello/Pelo', 'mosca': 'Plaga', 'sucio': 'Sucio', 
            'bano': 'Baños', 'papel': 'Sin papel', 'agua': 'Sin agua'
          };

          Object.keys(badWords).forEach(key => {
            if (text.includes(normalizeText(key))) {
              wordCounts[badWords[key]] = (wordCounts[badWords[key]] || 0) + 1;
            }
          });

        } else if (mode === 'good') {
          // Análisis de puntos fuertes
          if (text.includes('amable') || text.includes('atencion') || text.includes('rapido') || text.includes('mesero')) counts['servicio']++;
          if (text.includes('rico') || text.includes('rica') || text.includes('delicioso') || text.includes('sabor')) counts['comida']++;
          if (text.includes('refresco') || text.includes('cerveza')) counts['bebida']++;
          if (text.includes('limpio') || text.includes('limpieza') || text.includes('agradable')) counts['instalacion']++;
          if (text.includes('todo bien') || text.includes('perfecto') || text.includes('excelente') || text.includes('muy bien')) counts['general']++;

          const goodWords = {
            'rico': 'Rico', 'delicioso': 'Delicioso', 'excelente': 'Excelente', 
            'amable': 'Amable', 'rapido': 'Rápido', 'perfecto': 'Perfecto', 'limpio': 'Limpio'
          };

          Object.keys(goodWords).forEach(key => {
            if (text.includes(normalizeText(key))) {
              wordCounts[goodWords[key]] = (wordCounts[goodWords[key]] || 0) + 1;
            }
          });
        }
      });
      
      let maxCount = 0;
      for (const key in counts) {
        if (counts[key] > maxCount) maxCount = counts[key];
      }

      if (maxCount === 0) return mode === 'bad' ? "Sin quejas específicas" : "Todo tranquilo";

      const labels = { 
        'servicio': 'Servicio', 'comida': 'Comida', 'bebida': 'Bebidas', 
        'instalacion': 'Instalaciones', 'general': 'Experiencia General' 
      };

      const winners = Object.keys(counts).filter(key => counts[key] === maxCount).map(key => labels[key]);
      const mainCategory = winners.join(' y ');

      const topWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]).slice(0, 2);

      return topWords.length > 0 ? `${mainCategory} (${topWords.join(' y ')})` : mainCategory;
    };

    const mainComplaint = negatives.length > 0 ? detectTopic(negatives, 'bad') : "Ninguna";
    const strongPoint = positives.length > 0 ? detectTopic(positives, 'good') : "Ninguno";

    res.json({
      total,           
      criticalShift,  
      mainComplaint,  
      strongPoint    
    });

  } catch (error) {
    console.error("Error en getFeedbackStats:", error);
    res.status(500).json({ error: "Error calculando estadísticas" });
  }
};