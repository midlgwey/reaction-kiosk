import express from 'express';
import { createSuggestion, getSuggestions, getFeedbackStats, getLatestSuggestions} from '../controllers/suggestionsController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/feedback-stats', authenticateAdmin, getFeedbackStats);

router.post('/register-suggestion', createSuggestion);

router.get('/view-suggestion', authenticateAdmin, getSuggestions);

router.get('/latest-suggestions', authenticateAdmin, getLatestSuggestions);


export default router;