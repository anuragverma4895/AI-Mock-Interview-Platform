import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const startInterview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getNextQuestion: (req: AuthRequest, res: Response) => Promise<void>;
export declare const submitAnswer: (req: AuthRequest, res: Response) => Promise<void>;
export declare const askFollowUp: (req: AuthRequest, res: Response) => Promise<void>;
export declare const endInterview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getInterview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserInterviews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTranscript: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=interviewController.d.ts.map