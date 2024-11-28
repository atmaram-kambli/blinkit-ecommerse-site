import { Router } from 'express';
import { regiterUserController, verifyEmailController } from '../controllers/user.controller.js';

const router = Router();

router.post('/register', regiterUserController);
router.post('/verify-email', verifyEmailController);

export default router;