import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Interview from '../models/Interview';
import { getChallenge, listChallenges, CodingChallenge } from '../utils/codingChallenges';
import { executeCodingChallenge, CompilerUnavailableError } from './judge0Runner';
import { normalizeBrowserResults } from '../utils/browserCodingResults';

export const startCoding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { challengeId, language } = req.body;
    if (req.body.customChallenge !== undefined) {
      res.status(400).json({ message: 'Only curated practice challenges are supported' });
      return;
    }

    let challenge: CodingChallenge;
    
    if (challengeId) {
      const found = getChallenge(challengeId);
      if (!found) {
        res.status(404).json({ message: 'Coding challenge not found' });
        return;
      }
      challenge = found;
    } else {
      const challenges = listChallenges();
      challenge = challenges[Math.floor(Math.random() * challenges.length)];
    }

    const interview = new Interview({
      userId: req.user?.id,
      interviewType: 'coding',
      status: 'in_progress',
      questions: [],
      currentQuestionIndex: 0,
      codingChallenge: {
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        language: language || challenge.language,
        starterCode: challenge.starterCode,
        starterCodes: challenge.starterCodes || {},
        testCases: challenge.testCases,
      },
      duration: 0, // Untimed practice; actual elapsed minutes are recorded on submission.
      startedAt: new Date(),
    });

    await interview.save();

    res.status(201).json({
      message: 'Coding session started',
      codingSession: {
        id: interview._id,
        challenge: challenge,
        language: language || challenge.language,
      },
    });
  } catch (error) {
    console.error('Error starting coding session:', error);
    res.status(500).json({ message: 'Error starting coding session' });
  }
};

/** Run test cases without submitting or closing the session. */
const reviewCodingSubmission = async (req: AuthRequest, res: Response, finalize: boolean): Promise<void> => {
  try {
    const { interviewId } = req.params;
    const { code } = req.body;
    if (typeof code !== 'string' || !code.trim() || code.length > 50000) {
      res.status(400).json({ message: 'Code is required (maximum 50,000 characters)' }); return;
    }

    const interview = await Interview.findById(interviewId);
    if (!interview || interview.userId.toString() !== req.user?.id) {
      res.status(404).json({ message: 'Coding session not found' }); return;
    }
    if (interview.interviewType !== 'coding' || interview.status !== 'in_progress') {
      res.status(409).json({ message: 'Coding session is no longer active' }); return;
    }
    const challenge = interview.codingChallenge;
    if (!challenge) {
      res.status(400).json({ message: 'No challenge associated with this session' }); return;
    }
    const language = String(req.body.language || challenge.language).toLowerCase();
    if (!['javascript', 'python', 'java', 'cpp', 'c'].includes(language)) {
      res.status(400).json({ message: 'Unsupported programming language' }); return;
    }

    let results: Array<{ passed: boolean; input: string; expected: string; actual: string }>;
    let evaluationMethod: 'browser_js' | 'judge0';
    if (language === 'javascript') {
      // Browser executes JavaScript locally in an isolated, disposable Web Worker.
      // Never evaluate untrusted JS inside Node. Submitted outputs are practice-only.
      try {
        results = normalizeBrowserResults(challenge.testCases, req.body.browserResults, challenge.title);
      } catch {
        res.status(400).json({ message: 'Run the JavaScript test cases in your browser before submitting.' });
        return;
      }
      evaluationMethod = 'browser_js';
    } else {
      results = await executeCodingChallenge(language, code, {
        title: challenge.title,
        starterCode: challenge.starterCode,
        starterCodes: challenge.starterCodes as Record<string,string> | undefined,
        testCases: challenge.testCases,
      });
      evaluationMethod = 'judge0';
    }
    const totalCount = results.length;
    const passedCount = results.filter(result => result.passed).length;

    if (finalize) {
      interview.codingEvaluationMethod = evaluationMethod;
      interview.codingResults = results;
      interview.codingPassedCount = passedCount;
      interview.codingTotalCount = totalCount;
      interview.status = 'completed';
      interview.completedAt = new Date();
      if (interview.startedAt) {
        interview.duration = Math.max(0, Math.round((interview.completedAt.getTime() - interview.startedAt.getTime()) / 60000));
      }
      interview.finalScore = totalCount > 0 ? (passedCount / totalCount) * 5 : 0;
      await interview.save();
    }
    res.json({
      message: finalize ? 'Coding session submitted' : 'Code execution complete; session remains active',
      results, passedCount, totalCount,
      finalScore: finalize ? interview.finalScore : undefined,
      evaluationMethod,
      finalized: finalize,
    });
  } catch (error) {
    console.error('Error evaluating coding challenge:', error);
    if (error instanceof CompilerUnavailableError) {
      res.status(503).json({ message: error.message });
    } else {
      res.status(422).json({ message: error instanceof Error ? error.message : 'Cannot execute this challenge' });
    }
  }
};

export const runCoding = async (req: AuthRequest, res: Response): Promise<void> =>
  reviewCodingSubmission(req, res, false);

export const submitCoding = async (req: AuthRequest, res: Response): Promise<void> =>
  reviewCodingSubmission(req, res, true);

export const getUserCodingSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await Interview.find({
      userId: req.user?.id,
      interviewType: 'coding',
      status: 'completed',
    })
      .select(
        '_id codingChallenge codingResults codingPassedCount codingTotalCount codingEvaluationMethod finalScore completedAt startedAt'
      )
      .sort({ completedAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching coding sessions:', error);
    res.status(500).json({ message: 'Error fetching coding sessions' });
  }
};

export const listCodingChallenges = async (req: Request, res: Response): Promise<void> => {
  const { difficulty, category } = req.query;
  let challenges = listChallenges();

  if (difficulty) {
    challenges = challenges.filter(c => c.difficulty === difficulty);
  }
  
  if (category) {
    challenges = challenges.filter(c => c.category === category);
  }

  res.json(challenges);
};

export const getCodingSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await Interview.findById(req.params.interviewId);
    if (!session) {
      res.status(404).json({ message: 'Coding session not found' });
      return;
    }
    if (session.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }
    res.json(session);
  } catch (error) {
    console.error('Error fetching coding session:', error);
    res.status(500).json({ message: 'Error fetching coding session' });
  }
};
