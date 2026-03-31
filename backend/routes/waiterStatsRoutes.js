import express from 'express';

import { getWaitersTableRanking, getWaiterRadiography, getAllWaiters } from '../controllers/waiterStatsController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/get-waitersranking', authenticateAdmin, getWaitersTableRanking);
router.get('/get-waitersradiography', authenticateAdmin, getWaiterRadiography);
router.get('/get-allwaiters', authenticateAdmin, getAllWaiters); 

export default router;