import { Response } from 'express';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import Interview from '../models/Interview';
import { saveVideoChunk, combineVideoChunks, uploadVideoToCloudinary } from '../services/videoService';

export const uploadVideoChunk = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId, chunkIndex } = req.body;
    
    if (!req.file) {
      res.status(400).json({ message: 'No video chunk provided' });
      return;
    }

    // Verify user owns this interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }

    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized: You can only upload videos for your own interviews' });
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

    // Verify user owns this interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }

    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized: You can only finalize videos for your own interviews' });
      return;
    }

    const videoUrl = await combineVideoChunks(interviewId, parseInt(totalChunks));

    interview.videoPath = videoUrl;
    await interview.save();

    res.json({ message: 'Video finalized and uploaded to Cloudinary', videoPath: videoUrl });
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

    // Verify user owns this interview
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized: You can only view your own videos' });
      return;
    }

    res.json({
      videoUrl: interview.videoPath,
      interviewId: interview._id,
      jobRole: interview.jobRole,
      difficulty: interview.difficulty,
      role: interview.role,
      status: interview.status,
      completedAt: interview.completedAt,
      finalScore: interview.finalScore,
    });
  } catch (error) {
    console.error('Error getting video info:', error);
    res.status(500).json({ message: 'Error getting video info', error: String(error) });
  }
};

export const getVideoStreamUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id);
    if (!interview || !interview.videoPath) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    // Verify user owns this interview
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    // Return Cloudinary URL for streaming
    res.json({ url: interview.videoPath });
  } catch (error) {
    console.error('Error getting video stream URL:', error);
    res.status(500).json({ message: 'Error getting video stream URL', error: String(error) });
  }
};

export const analyzeBodyLanguage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { frameData } = req.body;

    // Placeholder analysis logic
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