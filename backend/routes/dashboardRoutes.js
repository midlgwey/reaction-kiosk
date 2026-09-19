import express from 'express';

import { authenticateAdmin, authorizePermissions } from "../middlewares/authMiddleware.js"
import { 
  getDailyReactions, 
  getDailyServerScore, 
  getLowInteractionWaiters, 
  getDailySurveyCount, 
  getDailySatisfactionTrend, 
  getDailyQuestions, 
  checkInactivity,
  getLowestRatedWaiter,
  getWorstRatedQuestion
} from '../controllers/dashboardController.js'

const router = express.Router();

// Ruta para la card de reacciones totales del día (CON TREND)
router.get('/daily-reactions', authenticateAdmin,  authorizePermissions('admin' , 'operativo') , getDailyReactions );

// Ruta para la card de encuestas realizadas o no por día (CON TREND)
router.get('/daily-survey-count', authenticateAdmin,  authorizePermissions('admin', 'operativo') , getDailySurveyCount);

// Ruta para la card de rating del servicio del día (CON TREND)
router.get('/daily-serverscore', authenticateAdmin,  authorizePermissions('admin', 'operativo') , getDailyServerScore)

// Ruta para la card de meseros con menos interacción (SIN TREND)
router.get('/daily-low-interaction', authenticateAdmin,  authorizePermissions('admin', 'operativo') , getLowInteractionWaiters)

// Ruta para la card de mesero con baja calificación (NUEVA - CON TREND)
router.get('/lowest-rated-waiter', authenticateAdmin,  authorizePermissions('admin', 'operativo') , getLowestRatedWaiter);

// Ruta para la card de pregunta peor calificada (NUEVA - CON TREND)
router.get('/worst-rated-question', authenticateAdmin,  authorizePermissions('admin', 'operativo') , getWorstRatedQuestion);

// Ruta para la gráfica de área de satisfacción por día
router.get('/daily-satisfaction', authenticateAdmin,  authorizePermissions('admin', 'operativo') , getDailySatisfactionTrend)

// Ruta para la radiografía de preguntas respondidas por día
router.get('/daily-questions', authenticateAdmin,  authorizePermissions('admin', 'operativo') , getDailyQuestions)

router.get('/check-inactivity', checkInactivity)

export default router;