import { Router } from 'express';
import { googleAuth, googleCallback, exchangeCode, getMe, updateProfile, updateSettings, logout } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { validateProfileUpdate, validateSettingsUpdate } from '../middleware/validation';

const router = Router();

// ── Google OAuth routes ──
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/exchange', exchangeCode);

// ── Authenticated routes (unchanged) ──
router.get('/me', auth, getMe);
router.patch('/profile', auth, validateProfileUpdate, updateProfile);
router.patch('/settings', auth, validateSettingsUpdate, updateSettings);
router.post('/logout', auth, logout);

export default router;
