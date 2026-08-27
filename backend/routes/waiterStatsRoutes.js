import express from 'express';

import { getWaitersTableRanking, getWaiterRadiography, getAllWaiters, getWaiterTables, getWaiterDeclines, getDeclinesLog, getSurveysLog, getWaiterPerformanceReport} from '../controllers/waiterStatsController.js';
import { authenticateAdmin, authorizePermissions } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/get-waitersranking', authenticateAdmin, authorizePermissions('admin'), getWaitersTableRanking);
router.get('/get-waitersradiography', authenticateAdmin, authorizePermissions('admin'), getWaiterRadiography);
router.get('/get-allwaiters', authenticateAdmin, authorizePermissions('admin'), getAllWaiters);
router.get('/get-waitertables', authenticateAdmin, authorizePermissions('admin'), getWaiterTables);
router.get('/get-waiterdeclines', authenticateAdmin, authorizePermissions('admin'), getWaiterDeclines);

//
router.get('/get-surveyslog', authenticateAdmin, authorizePermissions('admin'), getSurveysLog);
router.get('/get-declineslog', authenticateAdmin, authorizePermissions('admin'), getDeclinesLog);

//
router.get('/get-performance-report', authenticateAdmin, getWaiterPerformanceReport);

export default router;