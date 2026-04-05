import express from 'express';

import { getWaitersTableRanking, getWaiterRadiography, getAllWaiters, getWaiterTables, getWaiterDeclines, getDeclinesLog, getSurveysLog} from '../controllers/waiterStatsController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/get-waitersranking', authenticateAdmin, getWaitersTableRanking);
router.get('/get-waitersradiography', authenticateAdmin, getWaiterRadiography);
router.get('/get-allwaiters', authenticateAdmin, getAllWaiters); 
router.get('/get-waitertables', authenticateAdmin, getWaiterTables);
router.get('/get-waiterdeclines', authenticateAdmin, getWaiterDeclines); 

//
router.get('/get-surveyslog', authenticateAdmin, getSurveysLog);
router.get('/get-declineslog', authenticateAdmin, getDeclinesLog);

export default router;