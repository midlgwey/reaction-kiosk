import express from 'express';
import { createDecline } from '../controllers/declineController.js';

const router = express.Router();

router.post('/register-decline', createDecline);


export default router;