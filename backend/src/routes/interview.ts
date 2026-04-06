import { Router } from 'express';
import {
  startInterview,
  getNextQuestion,
  submitAnswer,
  endInterview,
  getInterview,
  getUserInterviews,
  getTranscript,
} from '../controllers/interviewController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/start', auth, startInterview);
router.get('/next-question/:interviewId', auth, getNextQuestion);
router.post('/submit-answer/:interviewId', auth, submitAnswer);
router.post('/end/:interviewId', auth, endInterview);
router.get('/:id', auth, getInterview);
router.get('/user/:userId', auth, getUserInterviews);
router.get('/transcript/:id', auth, getTranscript);

export default router;