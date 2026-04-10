import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const uploadResume: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getResume: (req: Request, res: Response) => Promise<void>;
export declare const getUserResumes: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteResume: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=resumeController.d.ts.map