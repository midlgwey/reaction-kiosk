import express from 'express';
import { createSuggestion, getSuggestions, getFeedbackStats, getLatestSuggestions } from '../controllers/suggestionsController.js';
import { authenticateAdmin, authorizePermissions } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta pública — la usan los clientes desde el kiosko, no requiere autenticación
router.post('/register-suggestion', createSuggestion);

// Las siguientes rutas son solo para admin
router.get('/feedback-stats', authenticateAdmin, authorizePermissions('admin'), getFeedbackStats);
router.get('/view-suggestion', authenticateAdmin, authorizePermissions('admin'), getSuggestions);
router.get('/latest-suggestions', authenticateAdmin, authorizePermissions('admin'), getLatestSuggestions);

export default router;