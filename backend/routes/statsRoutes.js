import express from 'express';

import { authenticateAdmin } from "../middlewares/authMiddleware.js"
import { getBestQuestionWeek, getWorstQuestionWeek, getOverallDistributionWeek, getWeeklySurveyChart, getWeeklyComparisonRadar, getWeeklyDayStrong, getWeeklyDayWeak} from '../controllers/statsController.js';

const router = express.Router();

// Rutas para estadisticas
router.get('/best-question-week', authenticateAdmin, getBestQuestionWeek )
router.get('/worst-question-week', authenticateAdmin, getWorstQuestionWeek )

//SATISFACCIÓN POR TURNO Y DÍA
router.get('/overall-distribution-week', authenticateAdmin, getOverallDistributionWeek )
//DISTRIBUCION DE PREGUNTAS POR BARRAS 
router.get('/by-question-week', authenticateAdmin, getWeeklySurveyChart )
//RADAR DE COMPARACION SEMANAL
router.get('/weekly-comparison', authenticateAdmin, getWeeklyComparisonRadar)

router.get('/weekly-day-strong', authenticateAdmin, getWeeklyDayStrong)
router.get('/weekly-day-weak', authenticateAdmin, getWeeklyDayWeak)

export default router;