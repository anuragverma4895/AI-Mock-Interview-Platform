import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const uploadVideoChunk: (req: AuthRequest, res: Response) => Promise<void>;
export declare const finalizeVideo: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getVideoInfo: (req: AuthRequest, res: Response) => Promise<void>;
export declare const downloadVideo: (req: AuthRequest, res: Response) => Promise<void>;
export declare const analyzeBodyLanguage: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=videoController.d.ts.map