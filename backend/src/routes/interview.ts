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
<<<<<<< HEAD
import { validateInterviewId, validateUserId, validateSubmitAnswer } from '../middleware/validation';
=======
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec

const router = Router();

router.post('/start', auth, startInterview);
<<<<<<< HEAD
router.get('/next-question/:interviewId', auth, validateInterviewId, getNextQuestion);
router.post('/submit-answer/:interviewId', auth, validateInterviewId, validateSubmitAnswer, submitAnswer);
router.post('/follow-up/:interviewId', auth, validateInterviewId, askFollowUp);
router.post('/end/:interviewId', auth, validateInterviewId, endInterview);
router.get('/:id', auth, validateInterviewId, getInterview);
router.get('/user/:userId', auth, validateUserId, getUserInterviews);
router.get('/transcript/:id', auth, validateInterviewId, getTranscript);
=======
router.get('/next-question/:interviewId', auth, getNextQuestion);
router.post('/submit-answer/:interviewId', auth, submitAnswer);
router.post('/follow-up/:interviewId', auth, askFollowUp);
router.post('/end/:interviewId', auth, endInterview);
router.get('/:id', auth, getInterview);
router.get('/user/:userId', auth, getUserInterviews);
router.get('/transcript/:id', auth, getTranscript);
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec

export default router;