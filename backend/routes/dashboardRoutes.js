import express from 'express';

import { authenticateAdmin } from "../middlewares/authMiddleware.js"
import { getDailyReactions, getDailyServerScore, getTodayHappinessIndex, getTodayHappinessByShift, getDailySatisfactionTrend, getWeeklySentimentSummary } from '../controllers/dashboardController.js'

const router = express.Router();

//Ruta para la card de reacciones totales del dia
router.get('/daily-reactions', authenticateAdmin, getDailyReactions )
//Ruta para la card de rating del servicio del dia
router.get('/daily-serverscore', authenticateAdmin, getDailyServerScore)
//Ruta para la card de indice de felicidad
router.get('/happiness-index', authenticateAdmin, getTodayHappinessIndex )
//Ruta para la card de indice de felicidad por turno 
router.get('/happiness-shift', authenticateAdmin, getTodayHappinessByShift)
//Ruta para la grafica de area de satisfaccion por dia
router.get('/daily-satisfaction', authenticateAdmin, getDailySatisfactionTrend)
//Ruta para la grafica de dona de distribucion de reacciones
router.get('/weekly-sentiment', authenticateAdmin, getWeeklySentimentSummary)


export default router;