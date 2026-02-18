import express from 'express';

import { createReaction} from '../controllers/reactionController.js'; 

const router = express.Router();

// Rutas para estadisticas
router.post('/', createReaction )


export default router;