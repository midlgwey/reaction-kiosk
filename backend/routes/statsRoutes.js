import express from 'express';

// 1. Importamos ambos middlewares
import { authenticateAdmin, authorizePermissions } from "../middlewares/authMiddleware.js";
import { getBestQuestionWeek, getWorstQuestionWeek, getOverallDistributionWeek, getWeeklySurveyChart, getWeeklyComparisonRadar, getWeeklyDayStrong, getWeeklyDayWeak, getWeeklyTotalSurveys, getWeeklyDeclinesTrend} from '../controllers/statsController.js';

const router = express.Router();

// 2. Agregamos authorizePermissions('admin') en cada ruta de estadísticas
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

export default router;