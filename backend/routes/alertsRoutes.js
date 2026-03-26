import express from 'express';

import { authenticateAdmin } from "../middlewares/authMiddleware.js"
import { getRecentAlerts } from '../controllers/alertsController.js';

const router = express.Router();

router.get('/recent-alerts', authenticateAdmin, getRecentAlerts)

export default router;