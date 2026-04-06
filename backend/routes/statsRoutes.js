import express from 'express';

import { authenticateAdmin } from "../middlewares/authMiddleware.js"
import { getBestQuestionWeek, getWorstQuestionWeek, getOverallDistributionWeek, getWeeklySurveyChart, getWeeklyComparisonRadar, getWeeklyDayStrong, getWeeklyDayWeak} from '../controllers/statsController.js';

const router = express.Router();

//Rutas para las estadisticas de las cards
router.get('/best-question-week', authenticateAdmin, getBestQuestionWeek )
router.get('/worst-question-week', authenticateAdmin, getWorstQuestionWeek )
router.get('/weekly-day-strong', authenticateAdmin, getWeeklyDayStrong)
router.get('/weekly-day-weak', authenticateAdmin, getWeeklyDayWeak)

//Ruta para la grafica de barras satisfaccion por turno y dia de la semana
router.get('/overall-distribution-week', authenticateAdmin, getOverallDistributionWeek )

//Ruta para el radar de comparacion semanal
router.get('/weekly-comparison', authenticateAdmin, getWeeklyComparisonRadar)



export default router;