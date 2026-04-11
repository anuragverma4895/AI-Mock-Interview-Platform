import { Router } from 'express';
import {
  startInterview,
  getNextQuestion,
  submitAnswer,
  endInterview,
  getInterview,
  getUserInterviews,
  getTranscript,
  askFollowUp,
} from '../controllers/interviewController';
import { auth } from '../middleware/auth';
import { validateInterviewId, validateUserId, validateSubmitAnswer } from '../middleware/validation';

const router = Router();

router.post('/start', auth, startInterview);
router.get('/next-question/:interviewId', auth, validateInterviewId, getNextQuestion);
router.post('/submit-answer/:interviewId', auth, validateInterviewId, validateSubmitAnswer, submitAnswer);
router.post('/follow-up/:interviewId', auth, validateInterviewId, askFollowUp);
router.post('/end/:interviewId', auth, validateInterviewId, endInterview);
router.get('/:id', auth, validateInterviewId, getInterview);
router.get('/user/:userId', auth, validateUserId, getUserInterviews);
router.get('/transcript/:id', auth, validateInterviewId, getTranscript);

export default router;