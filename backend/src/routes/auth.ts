import { Router } from 'express';
import { register, login, getMe, updateProfile, updateSettings } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/settings', auth, updateSettings);

export default router;