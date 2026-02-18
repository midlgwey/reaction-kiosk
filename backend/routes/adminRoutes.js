import express from 'express';
import { registerAdmin, loginAdmin, logoutAdmin, getCurrentAdmin} from '../controllers/authController.js';

import { validateRegisterInputAdmin, validateLoginInputAdmin, withValidationErrors } from '../middlewares/validationMiddleware.js'
import { authenticateAdmin  } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register-admin',  withValidationErrors(validateRegisterInputAdmin), registerAdmin); 
router.post('/login-admin', withValidationErrors(validateLoginInputAdmin), loginAdmin); 

router.post('/logout-admin', authenticateAdmin, logoutAdmin)
router.get('/me', authenticateAdmin, getCurrentAdmin);


export default router;

