import { Router } from 'express';
import { regiterUserController } from '../controllers/user.controller.js';

const router = Router();

router.post('register', regiterUserController);

export default router;