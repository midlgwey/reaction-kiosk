import express from 'express';

import { authenticateAdmin } from "../middlewares/authMiddleware.js"
import { getDailyReactions, getDailyServerScore, getTodayHappinessIndex, getTodayHappinessByShift, getDailySatisfactionTrend, getWeeklySentimentSummary } from '../controllers/dashboardController.js'

const router = express.Router();

router.get('/daily-reactions', authenticateAdmin, getDailyReactions )
router.get('/daily-serverscore', authenticateAdmin, getDailyServerScore)
router.get('/happiness-index', authenticateAdmin, getTodayHappinessIndex )
router.get('/happiness-shift', authenticateAdmin, getTodayHappinessByShift)
router.get('/daily-satisfaction', authenticateAdmin, getDailySatisfactionTrend)
router.get('/weekly-sentiment', authenticateAdmin, getWeeklySentimentSummary)


export default router;