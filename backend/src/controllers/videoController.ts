import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import Interview from '../models/Interview';
import { saveVideoChunk, combineVideoChunks, getVideoPath, videoExists, deleteVideoChunks } from '../services/videoService';

export const uploadVideoChunk = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId, chunkIndex } = req.body;
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    if (interview.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'You are not allowed to upload this interview' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No video chunk provided' });
      return;
    }

    await saveVideoChunk(interviewId, req.file.buffer, parseInt(chunkIndex));

    res.json({ message: 'Video chunk uploaded', chunkIndex });
  } catch (error) {
    console.error('Error uploading video chunk:', error);
    res.status(500).json({ message: 'Unable to upload video chunk' });
  }
};

export const finalizeVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId, totalChunks } = req.body;

    if (!req.user?.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    if (interview.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'You are not allowed to finalize this interview' });
      return;
    }

    const videoPath = await combineVideoChunks(interviewId, parseInt(totalChunks));
    if (interview) {
      interview.videoPath = videoPath;
      await interview.save();
    }

    res.json({ message: 'Video finalized', videoPath });
  } catch (error) {
    console.error('Error finalizing video:', error);
    res.status(500).json({ message: 'Unable to finalize video' });
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
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const exists = await videoExists(id);

    res.json({
      exists,
      path: interview.videoPath,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to get video information' });
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
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const exists = await videoExists(id);
    if (!exists) {
      res.status(404).json({ message: 'Video file not found' });
      return;
    }

    res.download(interview.videoPath);
  } catch (error) {
    res.status(500).json({ message: 'Unable to download video' });
  }
};

export const analyzeBodyLanguage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.status(501).json({
      message: 'Body language analysis is not configured. No analysis was generated.',
    });
  } catch (error) {
    console.error('Error analyzing body language:', error);
    res.status(500).json({ message: 'Error analyzing body language', error: String(error) });
  }
};
