import { Request, Response } from 'express';
import Interview from '../models/Interview';
import Resume from '../models/Resume';
import { generateQuestion, evaluateAnswer, generateFinalReport } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';

const QUESTION_CATEGORIES = ['DSA', 'SystemDesign', 'DB', 'HR', 'Project'];
const MAX_QUESTIONS = 15;
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

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
    const firstDifficulty = DIFFICULTY_LEVELS[1];

    const generatedQuestion = await generateQuestion(
      firstCategory,
      firstDifficulty,
      resumeData?.skills,
      resumeData?.projects?.map(p => p.name)
    );

    const interview = new Interview({
      userId: req.user?.id,
      resumeId: resumeId || undefined,
      status: 'in_progress',
      questions: [{
        question: generatedQuestion.question,
        category: generatedQuestion.category as any,
        difficulty: generatedQuestion.difficulty as any,
        idealAnswer: generatedQuestion.idealAnswer,
      }],
      currentQuestionIndex: 0,
      duration: duration || 45,
      startedAt: new Date(),
    });

    await interview.save();

    res.status(201).json({
      message: 'Interview started',
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

    const currentIdx = interview.currentQuestionIndex;
    
    if (currentIdx >= MAX_QUESTIONS - 1) {
      res.status(400).json({ message: 'Maximum questions reached' });
      return;
    }

    let resumeData = null;
    if (interview.resumeId) {
      const resume = await Resume.findById(interview.resumeId);
      if (resume) {
        resumeData = resume.parsedData;
      }
    }

    const category = QUESTION_CATEGORIES[(currentIdx + 1) % QUESTION_CATEGORIES.length];
    const difficulty = DIFFICULTY_LEVELS[Math.floor(Math.random() * 3)];

    const generatedQuestion = await generateQuestion(
      category,
      difficulty,
      resumeData?.skills,
      resumeData?.projects?.map(p => p.name)
    );

    interview.questions.push({
      question: generatedQuestion.question,
      category: generatedQuestion.category as any,
      difficulty: generatedQuestion.difficulty as any,
      idealAnswer: generatedQuestion.idealAnswer,
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
    
    const evaluation = await evaluateAnswer(
      currentQuestion.question,
      answer,
      currentQuestion.category,
      currentQuestion.difficulty,
      currentQuestion.idealAnswer
    );

    interview.questions[interview.currentQuestionIndex].answer = answer;
    interview.questions[interview.currentQuestionIndex].score = evaluation.score;
    interview.questions[interview.currentQuestionIndex].feedback = evaluation.feedback;

    interview.transcript.push({
      question: currentQuestion.question,
      answer,
      timestamp: new Date(),
    });

    await interview.save();

    res.json({
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        idealAnswer: evaluation.idealAnswer,
      },
      currentIndex: interview.currentQuestionIndex,
      totalQuestions: MAX_QUESTIONS,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Error submitting answer', error: String(error) });
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

    if (videoPath) {
      interview.videoPath = videoPath;
    }

    if (bodyLanguageData) {
      interview.bodyLanguageData = bodyLanguageData;
    }

    const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    interview.finalScore = totalScore / interview.questions.length;

    const finalReport = await generateFinalReport(
      interview.questions.map(q => ({
        question: q.question,
        answer: q.answer || '',
        score: q.score || 0,
        feedback: q.feedback || '',
      })),
      bodyLanguageData
    );

    await interview.save();

    res.json({
      message: 'Interview completed',
      interview: {
        id: interview._id,
        status: interview.status,
        finalScore: interview.finalScore,
        questionsCount: interview.questions.length,
        completedAt: interview.completedAt,
      },
      finalReport,
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