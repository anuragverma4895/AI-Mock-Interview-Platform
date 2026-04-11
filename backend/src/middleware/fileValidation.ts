import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';

const validateDocumentContent = async (filePath: string, buffer: Buffer): Promise<boolean> => {
  // Check PDF magic bytes: %PDF-
  if (buffer.length >= 5) {
    const header = buffer.subarray(0, 5).toString();
    if (header.startsWith('%PDF-')) {
      return true;
    }
  }

  // Check DOCX magic bytes (ZIP format): PK\x03\x04
  if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return true;
  }

  return false;
};

const validateVideoContent = async (filePath: string, buffer: Buffer): Promise<boolean> => {
  // WebM magic bytes: 0x1A 0x45 0xDF 0xA3
  if (buffer.length >= 4 && buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3) {
    return true;
  }

  // MP4/MOV: check for 'ftyp' at offset 4
  if (buffer.length >= 8) {
    const ftyp = buffer.subarray(4, 8).toString();
    if (ftyp === 'ftyp') {
      return true;
    }
  }

  // AVI: RIFF header
  if (buffer.length >= 4) {
    const riff = buffer.subarray(0, 4).toString();
    if (riff === 'RIFF') {
      return true;
    }
  }

  return false;
};

export const validateFileContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      return next();
    }

    const filePath = req.file.path;
    const buffer = await fs.readFile(filePath);

    // Determine if it's a document or video based on destination
    const isVideo = filePath.includes('videos');
    let isValid = false;

    if (isVideo) {
      isValid = await validateVideoContent(filePath, buffer);
      if (!isValid) {
        await fs.unlink(filePath);
        res.status(400).json({ message: 'Invalid video file content. Only WebM, MP4, AVI, and MOV are allowed.' });
        return;
      }
    } else {
      isValid = await validateDocumentContent(filePath, buffer);
      if (!isValid) {
        await fs.unlink(filePath);
        res.status(400).json({ message: 'Invalid document file content. Only PDF and DOCX are allowed.' });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('File validation error:', error);
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting invalid file:', unlinkError);
      }
    }
    res.status(500).json({ message: 'File validation failed' });
  }
};