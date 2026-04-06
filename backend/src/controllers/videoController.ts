import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import Interview from '../models/Interview';
import { saveVideoChunk, combineVideoChunks, getVideoPath, videoExists } from '../services/videoService';

export const uploadVideoChunk = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId, chunkIndex } = req.body;
    
    if (!req.file) {
      res.status(400).json({ message: 'No video chunk provided' });
      return;
    }

    await saveVideoChunk(interviewId, req.file.buffer, parseInt(chunkIndex));

    res.json({ message: 'Video chunk uploaded', chunkIndex });
  } catch (error) {
    console.error('Error uploading video chunk:', error);
    res.status(500).json({ message: 'Error uploading video chunk', error: String(error) });
  }
};

export const finalizeVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId, totalChunks } = req.body;

    const videoPath = await combineVideoChunks(interviewId, parseInt(totalChunks));

    const interview = await Interview.findById(interviewId);
    if (interview) {
      interview.videoPath = videoPath;
      await interview.save();
    }

    res.json({ message: 'Video finalized', videoPath });
  } catch (error) {
    console.error('Error finalizing video:', error);
    res.status(500).json({ message: 'Error finalizing video', error: String(error) });
  }
};

export const getVideoInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id);
    if (!interview || !interview.videoPath) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    res.json({
      exists: fs.existsSync(interview.videoPath),
      path: interview.videoPath,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting video info', error: String(error) });
  }
};

export const downloadVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id);
    if (!interview || !interview.videoPath) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    if (!fs.existsSync(interview.videoPath)) {
      res.status(404).json({ message: 'Video file not found on server' });
      return;
    }

    res.download(interview.videoPath, `interview-${id}.webm`);
  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({ message: 'Error downloading video', error: String(error) });
  }
};

export const analyzeBodyLanguage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { frameData } = req.body;

    const mockAnalysis = {
      eyeContact: 85,
      faceOrientation: 90,
      confidenceScore: 78,
      suggestions: [
        'Good eye contact maintained',
        'Face well-oriented toward camera',
        'Try to smile more to appear confident',
      ],
    };

    res.json(mockAnalysis);
  } catch (error) {
    console.error('Error analyzing body language:', error);
    res.status(500).json({ message: 'Error analyzing body language', error: String(error) });
  }
};