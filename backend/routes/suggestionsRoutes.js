import express from 'express';
import { createSuggestion, getSuggestions, getFeedbackStats, getLatestSuggestions} from '../controllers/suggestionsController.js';
import { authenticateAdmin, authorizePermissions } from '../middlewares/authMiddleware.js';

const router = express.Router();

//Ruta para registrar una nueva sugerencia
router.post('/register-suggestion', authenticateAdmin, authorizePermissions('admin'), createSuggestion);

router.get('/feedback-stats', authenticateAdmin, authorizePermissions('admin'), getFeedbackStats);

//Ruta para a obtener las sugerencias con paginacion y filtros
router.get('/view-suggestion', authenticateAdmin, authorizePermissions('admin'), getSuggestions);

//Ruta para obtener las ultimas sugerencias sin filtros ni paginacion
router.get('/latest-suggestions', authenticateAdmin, authorizePermissions('admin'), getLatestSuggestions);


export default router;