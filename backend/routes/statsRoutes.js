import express from 'express';

import { authenticateAdmin, authorizePermissions } from "../middlewares/authMiddleware.js";
import { getBestQuestionWeek, getWorstQuestionWeek, getOverallDistributionWeek, getWeeklySurveyChart, getWeeklyComparisonRadar, getWeeklyDayStrong, getWeeklyDayWeak, getWeeklyTotalSurveys, getWeeklyDeclinesTrend, getSurveyAcceptanceByDay, getQuestionTrend} from '../controllers/statsController.js';

const router = express.Router();

router.get('/best-question-week', authenticateAdmin, authorizePermissions('admin'), getBestQuestionWeek);
router.get('/worst-question-week', authenticateAdmin, authorizePermissions('admin'), getWorstQuestionWeek);
router.get('/weekly-day-strong', authenticateAdmin, authorizePermissions('admin'), getWeeklyDayStrong);
router.get('/weekly-day-weak', authenticateAdmin, authorizePermissions('admin'), getWeeklyDayWeak);

router.get('/weekly-declines-trend', authenticateAdmin, authorizePermissions('admin'), getWeeklyDeclinesTrend);
router.get('/weekly-total-surveys', authenticateAdmin, authorizePermissions('admin'), getWeeklyTotalSurveys);

// Ruta para la grafica de barras satisfaccion por turno y dia de la semana
router.get('/overall-distribution-week', authenticateAdmin, authorizePermissions('admin'), getOverallDistributionWeek);

// Ruta para el radar de comparacion semanal
router.get('/weekly-comparison', authenticateAdmin, authorizePermissions('admin'), getWeeklyComparisonRadar);

// Ruta para la grafica de barras de encuestas semanales
router.get('/weekly-survey-chart', authenticateAdmin, authorizePermissions('admin'), getWeeklySurveyChart);

// Ruta para la grafica de aceptacion de encuestas por dia
router.get('/survey-acceptance-by-day', authenticateAdmin, authorizePermissions('admin'), getSurveyAcceptanceByDay); 

router.get('/question-trend', authenticateAdmin, authorizePermissions('admin'), getQuestionTrend);
export default router;