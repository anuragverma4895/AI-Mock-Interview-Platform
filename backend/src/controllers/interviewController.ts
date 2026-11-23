import { Request, Response } from 'express';
import Interview from '../models/Interview';
import Resume from '../models/Resume';
import { 
  generateInterviewQuestion, 
  evaluateAnswer, 
  generateFinalReport,
  getGreeting,
  generateFollowUpQuestion
} from '../services/aiService';
import { AuthRequest } from '../middleware/auth';
import { createOpeningQuestion } from '../services/openingQuestion';

const CATEGORIES_BY_TYPE: Record<string, string[]> = {
  technical: ['DSA', 'SystemDesign', 'DB', 'Project', 'DSA'],
  hr: ['HR', 'Project', 'HR', 'Project', 'HR'],
  combine: ['DSA', 'SystemDesign', 'DB', 'HR', 'Project'],
};
const getCategoriesForType = (type: string) => CATEGORIES_BY_TYPE[type] || CATEGORIES_BY_TYPE.technical;
const DIFFICULTY_SEQUENCE = ['easy', 'medium', 'medium', 'hard', 'medium', 'hard', 'medium', 'hard', 'medium', 'hard'];
const MAX_QUESTIONS = 10;

export const startInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { resumeId, duration, jobRole, interviewType, difficulty } = req.body;

    let resumeData = null;
    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (resume) {
        if (resume.userId.toString() !== req.user?.id) {
          res.status(403).json({ message: 'Unauthorized resume' });
          return;
        }
        resumeData = resume.parsedData;
      }
    }

    const selectedInterviewType = interviewType === 'hr' || interviewType === 'combine' ? interviewType : 'technical';
    const selectedDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'easy';
    const selectedJobRole = typeof jobRole === 'string' && jobRole.trim() ? jobRole.trim() : undefined;
    const firstCategory = getCategoriesForType(selectedInterviewType)[0];
    const firstDifficulty = selectedDifficulty;
    // Never block interview startup on an external AI request.
    // Subsequent questions still use Gemini, and answers are evaluated as before.
    const firstQuestion = createOpeningQuestion(
      firstCategory,
      firstDifficulty,
      resumeData?.skills,
      resumeData?.projects,
      selectedJobRole
    );

    const interview = new Interview({
      userId: req.user?.id,
      resumeId: resumeId || undefined,
      interviewType: selectedInterviewType,
      jobRole: selectedJobRole,
      preferredDifficulty: selectedDifficulty,
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
    res.status(500).json({ message: 'Error starting interview' });
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
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    if (interview.status === 'completed') {
      res.status(400).json({ message: 'Interview already completed' });
      return;
    }

    if (!interview.questions[interview.currentQuestionIndex]?.answer?.trim()) {
      res.status(409).json({ message: 'Answer the current question before continuing' });
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
      question: t.question,
    }));

    const categories = getCategoriesForType(interview.interviewType);
    const category = categories[(interview.currentQuestionIndex + 1) % categories.length];
    const difficulty = interview.preferredDifficulty || DIFFICULTY_SEQUENCE[interview.currentQuestionIndex + 1] || 'medium';

    const newQuestion = await generateInterviewQuestion(
      category,
      difficulty,
      conversationHistory,
      resumeData?.skills,
      resumeData?.projects?.map(p => p.name),
      interview.jobRole,
      interview.interviewType,
      resumeData?.experience,
      resumeData?.projects
    );

    interview.questions.push({
      question: newQuestion.question,
      category: newQuestion.category as any,
      difficulty: newQuestion.difficulty as any,
      idealAnswer: newQuestion.idealAnswer,
    } as any);

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
    res.status(500).json({ message: 'Error getting next question' });
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId } = req.params;
    const { answer } = req.body;

    const sanitizedAnswer = answer.trim();

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    if (interview.status === 'completed') {
      res.status(400).json({ message: 'Interview already completed' });
      return;
    }

    const currentQuestion = interview.questions[interview.currentQuestionIndex];
    
    if (!currentQuestion) {
      res.status(409).json({ message: 'No current question available' }); return;
    }
    if (currentQuestion.answer?.trim()) {
      res.status(409).json({ message: 'This question has already been answered' }); return;
    }
    // Save first; defer expensive AI evaluation until after the interview.
    interview.questions[interview.currentQuestionIndex].answer = sanitizedAnswer;

    const transcriptIdx = interview.transcript.findIndex((_, i) => 
      interview.questions[interview.currentQuestionIndex].question === interview.transcript[i].question
    );
    if (transcriptIdx >= 0) {
      interview.transcript[transcriptIdx].answer = sanitizedAnswer;
    }

    await interview.save();

    res.json({
      saved: true,
      currentIndex: interview.currentQuestionIndex,
      totalQuestions: MAX_QUESTIONS,
      isLastQuestion: interview.currentQuestionIndex >= MAX_QUESTIONS - 1,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Error submitting answer' });
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
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
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
    res.status(500).json({ message: 'Error generating follow-up' });
  }
};

export const endInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId } = req.params;
    const { bodyLanguageData } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    if (interview.status !== 'completed') {
      interview.status = 'completed';
      interview.completedAt = new Date();
      if (bodyLanguageData) interview.bodyLanguageData = bodyLanguageData;
      const needsEvaluation = interview.questions.some(q => Boolean(q.answer?.trim()) && q.score === undefined);
      interview.evaluationStatus = needsEvaluation ? 'pending' : 'completed';
      interview.recordingStatus = req.body.recordingPending === true ? 'pending' : 'none';
      if (!needsEvaluation) {
        const scored = interview.questions.filter(q => typeof q.score === 'number');
        interview.finalScore = scored.length
          ? scored.reduce((sum, q) => sum + (q.score || 0), 0) / scored.length : 0;
      }
      await interview.save();
    }
    const closingMessage = interview.evaluationStatus === 'completed'
      ? 'Interview completed. Your results are ready.'
      : 'Interview completed. Your detailed feedback is being prepared.';

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
    res.status(500).json({ message: 'Error ending interview' });
  }
};


/** Client-triggered and idempotent final evaluation (durable DB state, no in-memory queue). */
export const evaluateInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  const interviewId = req.params.interviewId;
  try {
    const existing = await Interview.findOne({ _id: interviewId, userId: req.user?.id });
    if (!existing) { res.status(404).json({ message: 'Interview not found' }); return; }
    if (existing.status !== 'completed') {
      res.status(409).json({ message: 'Interview must be completed first' }); return;
    }
    // Existing records from older versions were already scored at submission time.
    if (!existing.evaluationStatus || existing.evaluationStatus === 'completed') {
      res.json({ status: 'completed', finalScore: existing.finalScore }); return;
    }

    const staleStart = new Date(Date.now() - 120000);
    const claimed = await Interview.findOneAndUpdate(
      {
        _id: interviewId, userId: req.user?.id, status: 'completed',
        $or: [
          { evaluationStatus: { $in: ['pending', 'failed'] } },
          { evaluationStatus: 'processing', evaluationStartedAt: { $lt: staleStart } },
        ],
      },
      { $set: { evaluationStatus: 'processing', evaluationStartedAt: new Date() } },
      { new: true }
    );
    if (!claimed) { res.status(202).json({ status: 'processing' }); return; }

    try {
      const pending = claimed.questions.map((q, i) =>
        q.answer?.trim() && q.score === undefined ? i : -1
      ).filter(i => i >= 0);
      // Keep AI concurrency bounded. Persist each completed batch for recoverability.
      for (let offset = 0; offset < pending.length; offset += 2) {
        const indices = pending.slice(offset, offset + 2);
        const results = await Promise.all(indices.map(async index => {
          const q = claimed.questions[index];
          return evaluateAnswer(q.question, q.answer || '', q.category, q.difficulty, [], q.idealAnswer);
        }));
        indices.forEach((index, position) => {
          const q = claimed.questions[index];
          const outcome = results[position];
          q.score = outcome.score;
          q.feedback = outcome.feedback;
          q.strengths = outcome.strengths;
          q.improvements = outcome.improvements;
          q.followUpQuestion = outcome.followUpQuestion;
          q.evaluationSource = outcome.source;
        });
        await claimed.save();
      }
      const scored = claimed.questions.filter(q => typeof q.score === 'number');
      claimed.finalScore = scored.length
        ? Math.round(scored.reduce((sum, q) => sum + (q.score || 0), 0) / scored.length * 10) / 10
        : 0;
      claimed.evaluationStatus = 'completed';
      await claimed.save();
      res.json({ status: 'completed', finalScore: claimed.finalScore });
    } catch (error) {
      claimed.evaluationStatus = 'failed';
      await claimed.save();
      console.error('Final evaluation failed:', error);
      res.status(503).json({ message: 'Feedback generation failed. You can retry from the results page.' });
    }
  } catch (error) {
    console.error('Final evaluation error:', error);
    res.status(500).json({ message: 'Unable to evaluate interview' });
  }
};

export const getInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findById(req.params.id).populate('resumeId');
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interview' });
  }
};

export const getUserInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.params.userId !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const interviews = await Interview.find({ userId: req.user?.id })
      .populate('resumeId')
      .sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interviews' });
  }
};

export const getTranscript = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }
    res.json({
      transcript: interview.transcript,
      questions: interview.questions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transcript' });
  }
};
