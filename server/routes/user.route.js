import { Router } from 'express';
import { loginController, logoutController, regiterUserController, verifyEmailController } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.post('/register', regiterUserController);
router.post('/verify-email', verifyEmailController);
router.post('/login', loginController);
router.get('/logout', auth, logoutController);

export default router;