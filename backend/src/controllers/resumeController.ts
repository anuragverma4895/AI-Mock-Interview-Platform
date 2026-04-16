import { Request, Response } from 'express';
import Resume from '../models/Resume';
import { parseResume } from '../services/resumeParser';
import path from 'path';
import { auth, AuthRequest } from '../middleware/auth';

export const uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    console.log('Parsing resume from:', req.file.path);
    const parsedData = await parseResume(req.file.path);
    console.log('Resume parsed successfully:', parsedData);

    const resume = new Resume({
      userId: req.user?.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      parsedData,
    });

    await resume.save();
    console.log('Resume saved to database:', resume._id);

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        _id: resume._id,
        id: resume._id,
        fileName: resume.fileName,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Error uploading resume', error: String(error) });
  }
};

export const getResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      res.status(404).json({ message: 'Resume not found' });
      return;
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resume', error: String(error) });
  }
};

export const getUserResumes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resumes = await Resume.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resumes', error: String(error) });
  }
};

export const deleteResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!resume) {
      res.status(404).json({ message: 'Resume not found' });
      return;
    }

    await Resume.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resume', error: String(error) });
  }
};