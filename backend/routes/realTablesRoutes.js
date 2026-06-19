import express from 'express';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';
import {
  captureRealTables,
  getRealTablesByMonth,
  updateRealTable,
  deleteRealTable
} from '../controllers/realTablesController.js';

const router = express.Router();

router.post('/capture', authenticateAdmin, captureRealTables);
router.get('/by-month', authenticateAdmin, getRealTablesByMonth);
router.put('/:id', authenticateAdmin, updateRealTable);
router.delete('/:id', authenticateAdmin, deleteRealTable);

export default router;