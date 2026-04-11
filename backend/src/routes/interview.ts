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
import { validateInterviewId, validateUserId, validateSubmitAnswer, validateId } from '../middleware/validation';

const router = Router();

router.post('/start', auth, startInterview);
router.get('/next-question/:interviewId', auth, validateInterviewId, getNextQuestion);
router.post('/submit-answer/:interviewId', auth, validateInterviewId, submitAnswer);
router.post('/follow-up/:interviewId', auth, validateInterviewId, askFollowUp);
router.post('/end/:interviewId', auth, validateInterviewId, endInterview);
router.get('/user/:userId', auth, validateUserId, getUserInterviews);
router.get('/transcript/:id', auth, validateId, getTranscript);
router.get('/:id', auth, validateId, getInterview);

export default router;