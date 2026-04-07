import express from 'express';

import { registerWaiter, loginWaiter, getActiveWaiters } from '../controllers/waiterController.js';

const router = express.Router();

router.post('/register-waiter', registerWaiter); 
router.post('/login-waiter', loginWaiter); 

//
router.get('/get-active-waiters', getActiveWaiters); 

export default router;