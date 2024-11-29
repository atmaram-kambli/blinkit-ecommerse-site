import { Router } from 'express';
import { loginController, logoutController, regiterUserController, updateUserDetails, uploadUserAvatar, verifyEmailController } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = Router();

router.post('/register', regiterUserController);
router.post('/verify-email', verifyEmailController);
router.post('/login', loginController);
router.get('/logout', auth, logoutController);
router.post('/update-user', auth, updateUserDetails);
router.put('/upload-avatar', auth, upload.single('avatar'), uploadUserAvatar);

export default router;