import { Request, Response } from 'express';
import Interview from '../models/Interview';
import Resume from '../models/Resume';
import { 
  generateInterviewQuestion, 
  evaluateAnswer, 
  generateFinalReport,
  getGreeting,
  getClosingMessage,
  generateFollowUpQuestion
} from '../services/aiService';
import { AuthRequest } from '../middleware/auth';

const QUESTION_CATEGORIES = ['DSA', 'SystemDesign', 'DB', 'HR', 'Project'];
const MAX_QUESTIONS = 10;

export const startInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { resumeId, duration } = req.body;

    let resumeData = null;
    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (resume) {
        resumeData = resume.parsedData;
      }
    }

    const firstCategory = QUESTION_CATEGORIES[0];
    const firstQuestion = await generateInterviewQuestion(
      firstCategory,
      'easy',
      [],
      resumeData?.skills,
      resumeData?.projects?.map(p => p.name)
    );

    const interview = new Interview({
      userId: req.user?.id,
      resumeId: resumeId || undefined,
      status: 'in_progress',
      questions: [{
        question: firstQuestion.question,
        category: firstQuestion.category as any,
        difficulty: firstQuestion.difficulty as any,
        idealAnswer: firstQuestion.idealAnswer,
      }],
      currentQuestionIndex: 0,
      transcript: [{
        question: firstQuestion.question,
        answer: '',
        timestamp: new Date(),
      }],
      duration: duration || 45,
      startedAt: new Date(),
    });

    await interview.save();

    const greeting = await getGreeting(req.user?.name);

    res.status(201).json({
      message: 'Interview started',
      greeting,
      interview: {
        id: interview._id,
        status: interview.status,
        currentQuestion: interview.questions[0],
        currentQuestionIndex: interview.currentQuestionIndex,
        totalQuestions: MAX_QUESTIONS,
        duration: interview.duration,
      },
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ message: 'Error starting interview', error: String(error) });
  }
};

export const getNextQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }

    if (interview.status === 'completed') {
      res.status(400).json({ message: 'Interview already completed' });
      return;
    }

    if (interview.currentQuestionIndex >= MAX_QUESTIONS - 1) {
      res.status(400).json({ message: 'Maximum questions reached' });
      return;
    }

    let resumeData = null;
    if (interview.resumeId) {
      const resume = await Resume.findById(interview.resumeId);
      if (resume) resumeData = resume.parsedData;
    }

    const conversationHistory = interview.transcript.map(t => ({
      role: t.answer ? 'user' : 'assistant',
      content: t.answer || t.question,
      timestamp: new Date(t.timestamp)
    }));

    const category = QUESTION_CATEGORIES[(interview.currentQuestionIndex + 1) % QUESTION_CATEGORIES.length];
    const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];

    const newQuestion = await generateInterviewQuestion(
      category,
      difficulty,
      conversationHistory,
      resumeData?.skills,
      resumeData?.projects?.map(p => p.name)
    );

    interview.questions.push({
      question: newQuestion.question,
      category: newQuestion.category as any,
      difficulty: newQuestion.difficulty as any,
      idealAnswer: newQuestion.idealAnswer,
    });

    interview.transcript.push({
      question: newQuestion.question,
      answer: '',
      timestamp: new Date(),
    });

    interview.currentQuestionIndex += 1;
    await interview.save();

    res.json({
      question: interview.questions[interview.currentQuestionIndex],
      currentIndex: interview.currentQuestionIndex,
      totalQuestions: MAX_QUESTIONS,
    });
  } catch (error) {
    console.error('Error getting next question:', error);
    res.status(500).json({ message: 'Error getting next question', error: String(error) });
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId } = req.params;
    const { answer } = req.body;

<<<<<<< HEAD
    const sanitizedAnswer = answer.trim();

=======
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }

    if (interview.status === 'completed') {
      res.status(400).json({ message: 'Interview already completed' });
      return;
    }

    const currentQuestion = interview.questions[interview.currentQuestionIndex];
    
    const conversationHistory = interview.transcript.map(t => ({
      role: t.answer ? 'user' : 'assistant',
      content: t.answer || t.question,
      timestamp: new Date(t.timestamp)
    }));

    const evaluation = await evaluateAnswer(
      currentQuestion.question,
<<<<<<< HEAD
      sanitizedAnswer,
=======
      answer,
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
      currentQuestion.category,
      currentQuestion.difficulty,
      conversationHistory,
      currentQuestion.idealAnswer
    );

    interview.questions[interview.currentQuestionIndex].answer = answer;
    interview.questions[interview.currentQuestionIndex].score = evaluation.score;
    interview.questions[interview.currentQuestionIndex].feedback = evaluation.feedback;

    const transcriptIdx = interview.transcript.findIndex((_, i) => 
      interview.questions[interview.currentQuestionIndex].question === interview.transcript[i].question
    );
    if (transcriptIdx >= 0) {
<<<<<<< HEAD
      interview.transcript[transcriptIdx].answer = sanitizedAnswer;
=======
      interview.transcript[transcriptIdx].answer = answer;
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
    }

    await interview.save();

    res.json({
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        idealAnswer: evaluation.idealAnswer,
        followUpQuestion: evaluation.followUpQuestion,
      },
      currentIndex: interview.currentQuestionIndex,
      totalQuestions: MAX_QUESTIONS,
      isLastQuestion: interview.currentQuestionIndex >= MAX_QUESTIONS - 1,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Error submitting answer', error: String(error) });
  }
};

export const askFollowUp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId } = req.params;
    const { answer } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }

    const currentQuestion = interview.questions[interview.currentQuestionIndex];
    
    const conversationHistory = interview.transcript.map(t => ({
      role: t.answer ? 'user' : 'assistant',
      content: t.answer || t.question,
      timestamp: new Date(t.timestamp)
    }));

    const followUp = await generateFollowUpQuestion(
      currentQuestion.question,
      answer || currentQuestion.answer || '',
      currentQuestion.category,
      conversationHistory
    );

    res.json({ followUpQuestion: followUp });
  } catch (error) {
    console.error('Error generating follow-up:', error);
    res.status(500).json({ message: 'Error generating follow-up', error: String(error) });
  }
};

export const endInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId } = req.params;
    const { videoPath, bodyLanguageData } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }

    interview.status = 'completed';
    interview.completedAt = new Date();

    if (videoPath) interview.videoPath = videoPath;
    if (bodyLanguageData) interview.bodyLanguageData = bodyLanguageData;

    const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    interview.finalScore = totalScore / interview.questions.length;

    const strongAreas = interview.questions
      .filter(q => (q.score || 0) >= 4)
      .map(q => q.category);
    
    const improvements = interview.questions
      .filter(q => (q.score || 0) < 3)
      .map(q => q.category);

    const closingMessage = await getClosingMessage(
      interview.finalScore,
      [...new Set(strongAreas)],
      [...new Set(improvements)]
    );

    await interview.save();

    res.json({
      message: 'Interview completed',
      closingMessage,
      interview: {
        id: interview._id,
        status: interview.status,
        finalScore: interview.finalScore,
        questionsCount: interview.questions.length,
        completedAt: interview.completedAt,
      },
    });
  } catch (error) {
    console.error('Error ending interview:', error);
    res.status(500).json({ message: 'Error ending interview', error: String(error) });
  }
};

export const getInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findById(req.params.id).populate('resumeId');
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interview', error: String(error) });
  }
};

export const getUserInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interviews = await Interview.find({ userId: req.user?.id })
      .populate('resumeId')
      .sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interviews', error: String(error) });
  }
};

export const getTranscript = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    res.json({
      transcript: interview.transcript,
      questions: interview.questions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transcript', error: String(error) });
  }
};