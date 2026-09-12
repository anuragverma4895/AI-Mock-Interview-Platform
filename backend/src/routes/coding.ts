import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import {
  startCoding,
  submitCoding,
  getUserCodingSessions,
  listCodingChallenges,
  getCodingSession,
} from '../services/codingService';

const router = Router();

// Public list of challenges (no auth)
router.get('/challenges', listCodingChallenges);

// Authenticated coding endpoints
router.post('/start', auth, startCoding);
router.post('/submit/:interviewId', auth, submitCoding);
router.get('/sessions', auth, getUserCodingSessions);
router.get('/sessions/:interviewId', auth, getCodingSession);

export default router;