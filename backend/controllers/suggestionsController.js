import { db } from "../db.js";
import { getShiftByTime } from '../utils/shiftUtils.js'; 
import { InternalServerError } from '../errors/customErrors.js'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendAlertTelegram } from '../utils/alertsUtils.js';

// Ajuste de hora para Tijuana (Invierno: -8, Verano: -7)
const TIME_OFFSET = '-7 hours';

// Inicializar Gemini 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// Crear Sugerencia (Fire and Forget)
export const createSuggestion = async (req, res) => {

  const { comment, rating_context, waiter_id, table_number } = req.body;
  const shift = getShiftByTime();


  // Validación: el comentario es obligatorio para evitar registros vacíos
  if (!comment || comment.trim() === "") {
    throw new BadRequestError("El comentario no puede estar vacío");
  }

  // Validación de identidad: se requiere el ID del mesero y el número de mesa
  if (!waiter_id || !table_number) {
    throw new BadRequestError("Se requiere ID de mesero y número de mesa");
  }

  try {

    // Guardamos la sugerencia en la base de datos con un sentimiento inicial de "Neutral"
    const result = await db.execute({
      sql: `INSERT INTO suggestions (comment, rating_context, shift, sentiment, waiter_id, table_number) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [comment.trim(), rating_context || null, shift, 'Neutral', waiter_id, table_number],
    });

    // Obtenemos el ID del nuevo registro para su posterior actualización después del análisis de sentimiento
    const newId = result.lastInsertRowid; 

    res.status(201).json({ 
      success: true, 
      message: "Sugerencia recibida", 
      shift
    });

    // Análisis en segundo plano, después de responder al cliente
    analyzeSentimentInBackground(newId, comment.trim(), shift, waiter_id, table_number);

  } catch (error) {
    console.error("Error al insertar sugerencia:", error);
    throw new InternalServerError("No se pudo guardar la sugerencia");
  }
};

//Helpers
//Lista de conectores comunes que indican contraste o queja
const complaintConnectors = [
  "pero", "solo que", "aunque", "excepto",
  "nada mas que", "nada más que", "lo unico",
  "lo único", "deberian", "les falta"
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


// Análisis de sentimiento en segundo plano, con enfoque en detección de quejas ocultas y generación de alertas
async function analyzeSentimentInBackground(id, commentText, shift, waiter_id, table_number) {
  try {
    //Prompt a Gemini
    const prompt = `Analiza el sentimiento de este comentario para un restaurante de comida mexicana en Tijuana, Mexico. 
      Responde ÚNICAMENTE con una de estas tres palabras: "Positive", "Negative" o "Neutral".
      Considera que el cliente puede tener mala ortografía y ser una persona mayor (40-60+ años).
      Comentario: "${commentText}"`;

    //Envío del prompt a Gemini y obtención de la respuesta
    const result = await model.generateContent(prompt);
    // Convertimos la respuesta a minúsculas para evitar problemas de formato
    const rawResponse = result.response.text().trim().toLowerCase();

    // Filtro de seguridad: Identifica la intención sin importar si hay puntos o espacios
    let responseText = "Neutral";
    if (rawResponse.includes("positive")) responseText = "Positive";
    else if (rawResponse.includes("negative")) responseText = "Negative";
    
    console.log(`[ID: ${id}] IA terminó análisis: ${responseText}`);

    // Detección de quejas ocultas en comentarios mixtos
    const lowerCaseText = normalizeText(commentText);
    const complaintSegment = extractComplaintSegment(commentText);
    
    // Diccionario de incidencias operativas críticas
    const criticalKeywords = [
      'grosero','mal trato','de malas','sin ganas','actitud','prepotente','ignoraron', 'pesimo servicio','mala atención','desatención','mal servicio',
      "tardo en atender","no me atendieron","me dejaron esperando","sin atender","desatendieron","distraido", "no se pudo comer", "no se pudo tomar",
      'pelo','cabello','insecto','mosca','cucaracha','bicho','crudo','quemado',
      'frio','fria','tardo','tardaron','basura','no fue lo que pedi','sin sabor','rancio','desabrido','desabrida',
      "echado a perder","incomible","asqueroso","repugnante","apestoso",
      "apestaba el vaso","sabe a agua","sabe a nada","sabe raro","sabe mal","no sabe bien" ,"no sabia bien","sabor raro","sabor mal","sabor a agua","sabor a nada",
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
        console.log(`[ID: ${id}] BD actualizada: ${finalSentiment}`);
    }

    // Formateo y envío de la alerta vía Telegram
    if (finalSentiment === "Negative" || finalSentiment === "Review") {

         // Buscar nombre del mesero
        let waiterName = "Sin asignar";
        if (waiter_id) {
        const waiterResult = await db.execute({
          sql: `SELECT name FROM waiters WHERE id = ?`,
          args: [waiter_id]
        });
        if (waiterResult.rows.length > 0) waiterName = waiterResult.rows[0].name;
      }

      const alertReason = finalSentiment === "Review" ? "Queja mixta detectada" : "Comentario Negativo";
      const alertMessage = `🔴 ALERTA DE CRITICA\nTurno: ${shift}\nMotivo: ${alertReason}\n👤 Mesero: ${waiterName}\n📍 Mesa: ${table_number || "N/A"}\n\nComentario:\n"${commentText}"`;
       
       // Se envía la alerta a Telegram para notificar al gerente sobre la crítica recibida, incluyendo el comentario original para contexto.
       await sendAlertTelegram(alertMessage);

       // Guardar en la tabla alerts para el Dashboard
       await db.execute({
         sql: `INSERT INTO alerts (type, message, suggestion_id) VALUES (?, ?, ?)`,
         args: ['critica', alertMessage, Number(id)] 
       });
    }

  } catch (dbError) {
    console.error(`[ID: ${id}] Error en proceso de fondo IA:`, dbError);
  }
}

// Obtención del historial reciente de sugerencias
export const getSuggestions = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          s.id, 
          s.comment, 
          s.table_number,
          w.name AS mesero, 
          s.rating_context, 
          s.shift, 
          s.sentiment,
          datetime(created_at, '${TIME_OFFSET}') as date
        FROM suggestions s
        LEFT JOIN waiters w ON s.waiter_id = w.id
        ORDER BY s.created_at DESC
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
          if (text.includes('fria') || text.includes('frio') || text.includes('sin sabor') || text.includes('pelo') || text.includes('mosca') || text.includes('crudo')) counts['comida']++;
          if (text.includes('caro') || text.includes('tibia') || text.includes('cafe frio') || text.includes('cerveza caliente') || text.includes('refresco caliente') || text.includes('sabe a agua') || text.includes('sabe mal')) counts['bebida']++;
          if (text.includes('sucio') || text.includes('papel') || text.includes('bano') || text.includes('agua') || text.includes('olor')) counts['instalacion']++;

          // Diccionario de quejas
          const badWords = {
            'cafe frio': 'Café Frío', 'cerveza caliente': 'Bebida Caliente', 'refresco caliente': 'Bebida Caliente', 'tibia': 'Bebida Tibia',
            'sabe a agua': 'Bebida Aguada', 'sabe mal': 'Sabor Raro',
            'fria': 'Comida Fría', 'frio': 'Comida Fría', 
            'sin sabor': 'Sin sabor', 'desabrida': 'Sin sabor', 'rancio': 'Rancio',
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

export const getLatestSuggestions = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          s.id, 
          s.comment,
          s.table_number,
          w.name AS mesero,
          s.shift, 
          s.sentiment,
          datetime(s.created_at, '${TIME_OFFSET}') as date
        FROM suggestions s
        LEFT JOIN waiters w ON s.waiter_id = w.id
        ORDER BY s.created_at DESC
        LIMIT 5
      `
    });
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getLatestSuggestions:", error);
    throw new InternalServerError("Error al obtener últimas sugerencias");
  }
};