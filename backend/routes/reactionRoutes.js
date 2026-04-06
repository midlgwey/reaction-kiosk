import express from 'express';

import { createReaction} from '../controllers/reactionController.js'; 

const router = express.Router();

router.post('/', createReaction )


export default router;