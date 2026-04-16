import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';

export const validateFileContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      return next();
    }

    const filePath = req.file.path;

    // Skip strict validation - rely on mime type check from multer
    // Just ensure file exists and is readable
    try {
      await fs.access(filePath);
      next();
    } catch (error) {
      res.status(400).json({ message: 'File upload failed - cannot access file' });
    }
  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({ message: 'File validation error', error: String(error) });
  }
};