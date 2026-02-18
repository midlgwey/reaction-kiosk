import { db } from "../db.js";
import { getShiftByTime } from '../utils/shiftUtils.js'; 
import { InternalServerError } from '../errors/customErrors.js'
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    // Esto ocurre DESPUÉS de responder
    analyzeSentimentInBackground(newId, comment.trim());

  } catch (error) {
    console.error("Error:", error);
    if (!res.headersSent) res.status(500).json({ error: "Error" });
  }
};

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

    // DETECTOR DE TEMAS (Función interna)
    const detectTopic = (commentsList) => {
      let counts = { 'tiempo': 0, 'servicio': 0, 'comida': 0, 'higiene': 0, 'precio': 0, 'ambiente': 0 };
      
      commentsList.forEach(item => {
        const text = (item.comment || "").toLowerCase();
        if (text.includes('lento') || text.includes('tarda') || text.includes('hora')) counts['tiempo']++;
        else if (text.includes('mesero') || text.includes('atencion') || text.includes('grosero')) counts['servicio']++;
        else if (text.includes('sabor') || text.includes('fria') || text.includes('rica')) counts['comida']++;
        else if (text.includes('sucio') || text.includes('limpio') || text.includes('higiene')) counts['higiene']++;
        else if (text.includes('caro') || text.includes('precio') || text.includes('cuenta')) counts['precio']++;
        else if (text.includes('ruido') || text.includes('calor') || text.includes('lugar')) counts['ambiente']++;
      });
      
      const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      
      const labels = { 
        'tiempo': 'Rapidez / Tiempos', 
        'servicio': 'Atención Personal', 
        'comida': 'Sabor y Calidad', 
        'higiene': 'Limpieza', 
        'precio': 'Precios',
        'ambiente': 'Ambiente / Lugar'
      };

      return counts[winner] > 0 ? labels[winner] : "Varios";
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