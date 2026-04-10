import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { auth } from '../middleware/auth';
<<<<<<< HEAD
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
=======

const router = Router();

router.post('/register', register);
router.post('/login', login);
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
router.get('/me', auth, getMe);

export default router;