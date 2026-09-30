import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import Interview from '../models/Interview';

const router = Router();

/**
 * POST /api/demo/publish/:interviewId
 * Publish an interview recording so it appears on the demo page.
 * Works with both legacy Cloudinary recordings and Google Drive recordings.
 */
router.post('/publish/:interviewId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }
    // Must have either a Cloudinary URL or a Drive file
    if (!interview.recordingUrl && interview.driveUploadStatus !== 'uploaded') {
      res.status(400).json({ message: 'No recording found for this interview' });
      return;
    }

    interview.isPublished = true;
    await interview.save();

    res.json({ message: 'Interview published successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error publishing interview', error: String(error) });
  }
});

/**
 * POST /api/demo/unpublish/:interviewId
 * Unpublish an interview recording
 */
router.post('/unpublish/:interviewId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    interview.isPublished = false;
    await interview.save();

    res.json({ message: 'Interview unpublished' });
  } catch (error) {
    res.status(500).json({ message: 'Error unpublishing', error: String(error) });
  }
});

/**
 * DELETE /api/demo/recording/:interviewId
 * Delete a recording reference from the interview.
 * For Drive-backed recordings, the file remains in the user's Drive.
 */
router.delete('/recording/:interviewId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    // Clear legacy Cloudinary fields
    interview.recordingUrl = undefined;
    interview.recordingPublicId = undefined;

    // Clear Drive fields
    interview.driveFileId = undefined;
    interview.driveFileName = undefined;
    interview.driveFolderId = undefined;
    interview.driveUploadStatus = 'not_requested';
    interview.driveUploadError = undefined;
    interview.driveUploadedAt = undefined;

    interview.recordingDuration = 0;
    interview.isPublished = false;
    await interview.save();

    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recording', error: String(error) });
  }
});

/**
 * GET /api/demo/my-recordings
 * Get all recordings of the logged-in user (supports both legacy and Drive recordings).
 */
router.get('/my-recordings', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interviews = await Interview.find({
      userId: req.user?.id,
      status: 'completed',
      $or: [
        { recordingUrl: { $exists: true, $ne: '' } },
        { driveFileId: { $exists: true, $ne: '' }, driveUploadStatus: 'uploaded' },
      ],
    })
      .select('recordingUrl recordingDuration isPublished finalScore questions completedAt createdAt driveFileId driveFileName driveUploadStatus')
      .sort({ completedAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recordings', error: String(error) });
  }
});

/**
 * GET /api/demo/public
 * Get all published demo recordings (NO AUTH - public endpoint).
 * Supports both legacy Cloudinary and Drive-backed recordings.
 */
router.get('/public', async (req, res): Promise<void> => {
  try {
    const demos = await Interview.find({
      isPublished: true,
      status: 'completed',
      $or: [
        { recordingUrl: { $exists: true, $ne: '' } },
        { driveFileId: { $exists: true, $ne: '' }, driveUploadStatus: 'uploaded' },
      ],
    })
      .populate('userId', 'name')
      .select('recordingUrl recordingDuration finalScore questions userId completedAt createdAt driveFileId driveFileName driveUploadStatus')
      .sort({ completedAt: -1 })
      .limit(20);

    const result = demos.map((d: any) => ({
      id: d._id,
      recordingUrl: d.recordingUrl || null,
      driveFileId: d.driveFileId || null,
      driveUploadStatus: d.driveUploadStatus || 'not_requested',
      duration: d.recordingDuration,
      score: d.finalScore,
      questionsCount: d.questions?.length || 0,
      userName: d.userId?.name || 'Anonymous',
      completedAt: d.completedAt,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching demos', error: String(error) });
  }
});

export default router;
