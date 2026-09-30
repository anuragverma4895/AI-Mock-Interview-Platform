import { Router, Response } from 'express';
import fs from 'fs/promises';
import { auth, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Interview from '../models/Interview';
import {
  getDriveClientForUser,
  getOrCreateRecordingsFolder,
  uploadVideoToDrive,
  getDriveFileStream,
  getDriveFileMetadata,
  deleteDriveFile,
  generatePlaybackToken,
  validatePlaybackToken,
} from '../services/googleDriveService';
import { driveVideoUpload } from '../middleware/upload';

const router = Router();

/**
 * GET /api/drive/status
 * Check if the authenticated user has connected Google Drive.
 */
router.get('/status', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      connected: user.googleDriveConnected,
      connectedAt: user.googleDriveConnectedAt || null,
    });
  } catch (error) {
    console.error('Drive status error:', error);
    res.status(500).json({ message: 'Failed to check Drive status' });
  }
});

/**
 * GET /api/drive/disconnect
 * Disconnect Google Drive for the authenticated user.
 */
router.post('/disconnect', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.user?.id, {
      googleDriveConnected: false,
      googleDriveRefreshToken: undefined,
      googleDriveFolderId: undefined,
      googleDriveConnectedAt: undefined,
    });

    res.json({ message: 'Google Drive disconnected' });
  } catch (error) {
    console.error('Drive disconnect error:', error);
    res.status(500).json({ message: 'Failed to disconnect Drive' });
  }
});

/**
 * POST /api/drive/upload/:interviewId
 * Upload an interview recording to the user's Google Drive.
 * Accepts the final recording as multipart form data.
 */
router.post('/upload/:interviewId', auth, driveVideoUpload.single('recording'), async (req: AuthRequest, res: Response): Promise<void> => {
  let tempFilePath: string | undefined;
  let uploadedDriveFileId: string | undefined;

  try {
    const { interviewId } = req.params;
    const { duration } = req.body;
    // Capture the temp path immediately so even ownership/validation failures clean it up.
    tempFilePath = req.file?.path;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }

    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'You are not allowed to upload this interview' });
      return;
    }

    if (!req.file?.path) {
      res.status(400).json({ message: 'No recording file provided' });
      return;
    }

    // Drive authorization is obtained during Google login. There is deliberately
    // no OAuth redirect from this upload endpoint.
    let driveClient;
    try {
      driveClient = await getDriveClientForUser(req.user!.id);
    } catch {
      res.status(403).json({
        message: 'Google Drive access is not available for this account. Please sign in with Google again and allow Drive access.',
        code: 'DRIVE_NOT_CONNECTED',
      });
      return;
    }

    interview.driveUploadStatus = 'uploading';
    interview.driveUploadError = undefined;
    await interview.save();

    try {
      const folderId = await getOrCreateRecordingsFolder(driveClient.drive, req.user!.id);
      const date = new Date().toISOString().split('T')[0];
      const fileName = `Interview_${date}_${interviewId.slice(-6)}.webm`;

      const result = await uploadVideoToDrive(
        driveClient.drive,
        folderId,
        fileName,
        tempFilePath,
        req.file.mimetype || 'video/webm'
      );
      uploadedDriveFileId = result.fileId;

      interview.driveFileId = result.fileId;
      interview.driveFileName = result.fileName;
      interview.driveFolderId = folderId;
      interview.driveUploadStatus = 'uploaded';
      interview.driveUploadedAt = new Date();
      interview.driveUploadError = undefined;
      interview.recordingDuration = Number(duration) || 0;

      try {
        await interview.save();
      } catch (dbError) {
        // Avoid leaving an orphaned Drive recording when MongoDB cannot persist
        // the reference after a successful Drive upload.
        await deleteDriveFile(driveClient.drive, uploadedDriveFileId);
        throw dbError;
      }

      res.json({
        message: 'Recording uploaded to Google Drive',
        driveFileId: result.fileId,
        driveFileName: result.fileName,
      });
    } catch (uploadError) {
      interview.driveUploadStatus = 'failed';
      interview.driveUploadError = 'Upload failed';
      await interview.save();

      console.error('Drive upload failed:', uploadError);
      res.status(500).json({ message: 'Failed to upload the recording to Google Drive' });
    }
  } catch (error) {
    console.error('Drive upload route error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Unable to upload the recording right now' });
    }
  } finally {
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError: any) {
        if (cleanupError?.code !== 'ENOENT') {
          console.error('Drive temp file cleanup failed:', cleanupError);
        }
      }
    }
  }
});

/**
 * POST /api/drive/skip/:interviewId
 * Mark interview recording as skipped (user chose not to upload).
 */
router.post('/skip/:interviewId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
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

    interview.driveUploadStatus = 'skipped';
    interview.driveUploadError = undefined;
    await interview.save();

    res.json({ message: 'Recording upload skipped' });
  } catch (error) {
    console.error('Drive skip error:', error);
    res.status(500).json({ message: 'Unable to update recording status' });
  }
});

/**
 * GET /api/drive/playback-token/:interviewId
 * Generate a short-lived playback token for video streaming.
 */
router.get('/playback-token/:interviewId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }

    // Published demos are intentionally viewable by authenticated users, but the
    // Drive credentials must always belong to the interview owner.
    if (interview.userId.toString() !== req.user?.id && !interview.isPublished) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    if (!interview.driveFileId || interview.driveUploadStatus !== 'uploaded') {
      res.status(404).json({ message: 'No Drive recording available for this interview' });
      return;
    }

    const tokenOwnerId = interview.userId.toString();
    const token = generatePlaybackToken(req.params.interviewId, tokenOwnerId);

    res.json({ token, expiresIn: 300 }); // 5 minutes
  } catch (error) {
    console.error('Playback token error:', error);
    res.status(500).json({ message: 'Failed to generate playback token' });
  }
});

/**
 * GET /api/drive/stream/:interviewId
 * Stream video from Google Drive through our backend.
 * Requires a valid short-lived playback token.
 * Supports HTTP Range requests for seeking.
 */
router.get('/stream/:interviewId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(401).json({ message: 'Playback token required' });
      return;
    }

    // Validate the playback token
    const tokenData = validatePlaybackToken(token);
    if (!tokenData) {
      res.status(401).json({ message: 'Playback token expired or invalid' });
      return;
    }

    if (tokenData.interviewId !== req.params.interviewId) {
      res.status(403).json({ message: 'Token does not match this interview' });
      return;
    }

    // Get interview and verify it has a Drive file
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview || !interview.driveFileId) {
      res.status(404).json({ message: 'Recording not found' });
      return;
    }

    // Never let a playback token select a different user's Drive credentials.
    if (interview.userId.toString() !== tokenData.userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    // Get Drive client for the file owner
    let driveClient;
    try {
      driveClient = await getDriveClientForUser(tokenData.userId);
    } catch {
      res.status(500).json({ message: 'Drive connection unavailable' });
      return;
    }

    // Check if the file still exists
    const fileMeta = await getDriveFileMetadata(driveClient.drive, interview.driveFileId);
    if (!fileMeta) {
      res.status(404).json({ message: 'Recording file not found in Google Drive. It may have been deleted.' });
      return;
    }

    const fileSize = fileMeta.size;
    const mimeType = fileMeta.mimeType;

    // Handle Range header for seeking support
    const rangeHeader = req.headers.range;

    if (rangeHeader) {
      const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : fileSize - 1;

        if (fileSize <= 0 || start >= fileSize || end < start) {
          res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).json({ message: 'Requested video range is not satisfiable' });
          return;
        }

        const safeEnd = Math.min(end, fileSize - 1);
        const chunkSize = safeEnd - start + 1;

        const { stream } = await getDriveFileStream(driveClient.drive, interview.driveFileId, { start, end: safeEnd });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${safeEnd}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': mimeType,
          'Cache-Control': 'private, max-age=300',
        });

        (stream as any).pipe(res);
      } else {
        res.status(416).json({ message: 'Invalid Range header' });
      }
    } else {
      // No range — stream the entire file
      const { stream } = await getDriveFileStream(driveClient.drive, interview.driveFileId);

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=300',
      });

      (stream as any).pipe(res);
    }
  } catch (error: any) {
    console.error('Drive stream error:', error.message || error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to stream video' });
    }
  }
});

export default router;
