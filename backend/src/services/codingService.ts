import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Interview from '../models/Interview';
import { getChallenge, listChallenges, CodingChallenge } from '../utils/codingChallenges';
import { evaluateCode } from './aiService';

export const startCoding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { challengeId, language, customChallenge } = req.body;

    let challenge: CodingChallenge;
    
    if (customChallenge) {
      challenge = {
        ...customChallenge,
        id: 'custom-' + Date.now(),
        timeLimit: customChallenge.timeLimit || 1800,
      };
    } else if (challengeId) {
      const found = getChallenge(challengeId);
      if (!found) {
        res.status(404).json({ message: 'Coding challenge not found' });
        return;
      }
      challenge = found;
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

    // Default to the language the session was started with, but allow override on submission
    const evalLanguage = req.body.language || challenge.language;
    const fnName = challenge.title.toLowerCase().replace(/\s+/g, '');

    const { results, passedCount, totalCount } = await evaluateCode(
      code,
      evalLanguage,
      challenge.testCases,
      fnName
    );


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
    res.status(500).json({ message: 'Error fetching coding session', error: String(error) });
  }
};

import { generateCodingChallenge } from './aiService';

export const generateChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { difficulty, language, context } = req.body;
    const challenge = await generateCodingChallenge(difficulty, language, context);
    res.status(200).json(challenge);
  } catch (error) {
    console.error('Error generating AI coding challenge:', error);
    res.status(500).json({ message: 'Error generating challenge', error: String(error) });
  }
};