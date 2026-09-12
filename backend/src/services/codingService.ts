import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Interview from '../models/Interview';
import { getChallenge, listChallenges, CodingChallenge } from '../utils/codingChallenges';

export const startCoding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { challengeId, language } = req.body;

    let challenge: CodingChallenge | undefined;
    if (challengeId) {
      challenge = getChallenge(challengeId);
      if (!challenge) {
        res.status(404).json({ message: 'Coding challenge not found' });
        return;
      }
    } else {
      challenge = listChallenges()[0];
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
        timeLimit: challenge.timeLimit,
        language: language || challenge.language,
        starterCode: challenge.starterCode,
        testCases: challenge.testCases,
      },
      duration: Math.ceil(challenge.timeLimit / 60),
      startedAt: new Date(),
    });

    await interview.save();

    res.status(201).json({
      message: 'Coding session started',
      codingSession: {
        id: interview._id,
        challenge: challenge,
        timeLimit: challenge.timeLimit,
        language: language || challenge.language,
      },
    });
  } catch (error) {
    console.error('Error starting coding session:', error);
    res.status(500).json({ message: 'Error starting coding session', error: String(error) });
  }
};

export const submitCoding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId } = req.params;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ message: 'Code is required' });
      return;
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Coding session not found' });
      return;
    }
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }
    if (interview.interviewType !== 'coding') {
      res.status(400).json({ message: 'Not a coding session' });
      return;
    }

    const challenge = interview.codingChallenge;
    if (!challenge) {
      res.status(400).json({ message: 'No challenge associated with this session' });
      return;
    }

    const results: Array<{ passed: boolean; input: string; expected: string; actual: string }> = [];

    for (const testCase of challenge.testCases) {
      let passed = false;
      let actual = '';

      try {
        const args = new Function(`return [${testCase.input}];`)();
        const fnName = challenge.title.toLowerCase().replace(/\s+/g, '');
        const solution = new Function(
          `${code}; return typeof ${fnName} === "function" ? ${fnName} : null;`
        )();

        if (typeof solution !== 'function') {
          actual = 'Error: define a function named ' + fnName;
        } else {
          const actualValue = solution(...args);
          const actualStr = JSON.stringify(actualValue);
          const expectedStr = JSON.stringify(JSON.parse(testCase.expectedOutput));
          passed = actualStr === expectedStr;
          actual = actualStr;
        }
      } catch (error: any) {
        actual = error instanceof Error ? error.message : 'Execution error';
        passed = false;
      }

      results.push({
        passed,
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual,
      });
    }

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    interview.codingResults = results as any;
    interview.codingPassedCount = passedCount;
    interview.codingTotalCount = totalCount;
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.finalScore = totalCount > 0 ? (passedCount / totalCount) * 5 : 0;

    await interview.save();

    res.json({
      message: 'Coding session completed',
      results,
      passedCount,
      totalCount,
      finalScore: interview.finalScore,
    });
  } catch (error) {
    console.error('Error submitting coding session:', error);
    res.status(500).json({ message: 'Error submitting coding session', error: String(error) });
  }
};

export const getUserCodingSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await Interview.find({
      userId: req.user?.id,
      interviewType: 'coding',
      status: 'completed',
    })
      .select(
        '_id codingChallenge codingResults codingPassedCount codingTotalCount finalScore completedAt startedAt'
      )
      .sort({ completedAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching coding sessions:', error);
    res.status(500).json({ message: 'Error fetching coding sessions', error: String(error) });
  }
};

export const listCodingChallenges = async (req: Request, res: Response): Promise<void> => {
  res.json(listChallenges());
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
    res.status(500).json({ message: 'Error fetching coding session', error: String(error) });
  }
};