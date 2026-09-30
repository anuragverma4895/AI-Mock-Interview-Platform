import { Router, Response } from 'express';
import crypto from 'crypto';
import { auth, AuthRequest } from '../middleware/auth';
import config from '../config';
import User from '../models/User';
import Interview from '../models/Interview';
import {
  generateDriveAuthUrl,
  exchangeDriveCode,
  encryptToken,
  getDriveClientForUser,
  getOrCreateRecordingsFolder,
  uploadVideoToDrive,
  getDriveFileStream,
  getDriveFileMetadata,
  deleteDriveFile,
  generatePlaybackToken,
  validatePlaybackToken,
} from '../services/googleDriveService';
import { videoUpload } from '../middleware/upload';

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
 * GET /api/drive/connect
 * Initiates Google Drive OAuth flow.
 * The user must already be authenticated in the application.
 */
router.get('/connect', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!config.googleClientId || !config.googleClientSecret) {
      res.status(500).json({ message: 'Google OAuth is not configured' });
      return;
    }

    // Generate CSRF state containing the user ID (encrypted)
    const statePayload = JSON.stringify({
      userId: req.user?.id,
      nonce: crypto.randomBytes(16).toString('hex'),
    });
    const state = encryptToken(statePayload);

    // Store state in HTTP-only cookie (5 minutes)
    res.cookie('drive_oauth_state', state, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
      path: '/',
    });

    const authUrl = generateDriveAuthUrl(state);
    res.json({ authUrl });
  } catch (error) {
    console.error('Drive connect error:', error);
    res.status(500).json({ message: 'Failed to initiate Drive connection' });
  }
});

/**
 * GET /api/drive/callback
 * Handles the Google Drive OAuth callback.
 * Exchanges the authorization code for tokens and stores the encrypted refresh token.
 */
router.get('/callback', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      console.error('Drive OAuth error:', oauthError);
      res.redirect(`${config.frontendUrl}/settings?drive_error=denied`);
      return;
    }

    if (!code || typeof code !== 'string') {
      res.redirect(`${config.frontendUrl}/settings?drive_error=missing_code`);
      return;
    }

    // CSRF validation
    const savedState = req.cookies?.drive_oauth_state;
    if (!state || !savedState || state !== savedState) {
      console.error('Drive OAuth state mismatch — possible CSRF');
      res.redirect(`${config.frontendUrl}/settings?drive_error=invalid_state`);
      return;
    }

    // Clear the state cookie
    res.clearCookie('drive_oauth_state', { path: '/' });

    // Exchange code for tokens
    const { refreshToken } = await exchangeDriveCode(code);

    // Encrypt the refresh token before storing
    const encryptedToken = encryptToken(refreshToken);

    // The state contains the user ID — decrypt it
    // Since the state is the encrypted statePayload, we need to find the user
    // For the callback we need to extract user from the state
    let userId: string;
    try {
      const { decryptToken } = await import('../services/googleDriveService');
      const statePayload = JSON.parse(decryptToken(savedState));
      userId = statePayload.userId;
    } catch {
      res.redirect(`${config.frontendUrl}/settings?drive_error=invalid_state`);
      return;
    }

    // Update user with Drive credentials
    await User.findByIdAndUpdate(userId, {
      googleDriveConnected: true,
      googleDriveRefreshToken: encryptedToken,
      googleDriveConnectedAt: new Date(),
    });

    console.log(`Google Drive connected for user ${userId}`);

    // Redirect to frontend with success
    res.redirect(`${config.frontendUrl}/settings?drive_connected=true`);
  } catch (error: any) {
    console.error('Drive callback error:', error.message || error);
    res.redirect(`${config.frontendUrl}/settings?drive_error=callback_failed`);
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
 * Accepts multipart file upload or base64.
 */
router.post('/upload/:interviewId', auth, videoUpload.single('recording'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId } = req.params;
    const { videoBase64, duration } = req.body;

    // Find interview and verify ownership
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: 'Interview not found' });
      return;
    }
    if (interview.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    // Get the video buffer
    let videoBuffer: Buffer | null = req.file?.buffer || null;
    if (!videoBuffer && typeof videoBase64 === 'string') {
      const base64Data = videoBase64.replace(/^data:video\/\w+;base64,/, '');
      videoBuffer = Buffer.from(base64Data, 'base64');
    }
    if (!videoBuffer || videoBuffer.length === 0) {
      res.status(400).json({ message: 'No recording file provided' });
      return;
    }

    // Check Drive connection
    let driveClient;
    try {
      driveClient = await getDriveClientForUser(req.user!.id);
    } catch {
      res.status(400).json({ message: 'Google Drive is not connected. Please connect Drive first.', code: 'DRIVE_NOT_CONNECTED' });
      return;
    }

    // Update status to uploading
    interview.driveUploadStatus = 'uploading';
    await interview.save();

    console.log(`Uploading recording for interview ${interviewId} to Google Drive (${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB)...`);

    try {
      // Get or create the recordings folder
      const folderId = await getOrCreateRecordingsFolder(driveClient.drive, req.user!.id);

      // Generate a descriptive filename
      const date = new Date().toISOString().split('T')[0];
      const fileName = `Interview_${date}_${interviewId.slice(-6)}.webm`;

      // Upload to Drive
      const result = await uploadVideoToDrive(driveClient.drive, folderId, fileName, videoBuffer);

      // Update interview with Drive metadata
      interview.driveFileId = result.fileId;
      interview.driveFileName = result.fileName;
      interview.driveFolderId = folderId;
      interview.driveUploadStatus = 'uploaded';
      interview.driveUploadedAt = new Date();
      interview.driveUploadError = undefined;
      interview.recordingDuration = Number(duration) || 0;
      await interview.save();

      console.log(`Recording uploaded to Drive: ${result.fileId}`);

      res.json({
        message: 'Recording uploaded to Google Drive',
        driveFileId: result.fileId,
        driveFileName: result.fileName,
      });
    } catch (uploadError: any) {
      // Mark as failed
      interview.driveUploadStatus = 'failed';
      interview.driveUploadError = uploadError.message || 'Upload failed';
      await interview.save();

      console.error('Drive upload failed:', uploadError);
      res.status(500).json({ message: 'Failed to upload to Google Drive', error: uploadError.message });
    }
  } catch (error) {
    console.error('Drive upload route error:', error);
    res.status(500).json({ message: 'Error uploading recording', error: String(error) });
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
    await interview.save();

    res.json({ message: 'Recording upload skipped' });
  } catch (error) {
    res.status(500).json({ message: 'Error skipping upload', error: String(error) });
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

    // Verify ownership (unless the interview is published)
    if (interview.userId.toString() !== req.user?.id && !interview.isPublished) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    if (!interview.driveFileId || interview.driveUploadStatus !== 'uploaded') {
      res.status(404).json({ message: 'No Drive recording available for this interview' });
      return;
    }

    const token = generatePlaybackToken(req.params.interviewId, interview.userId.toString());

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
        const chunkSize = end - start + 1;

        const { stream } = await getDriveFileStream(driveClient.drive, interview.driveFileId, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
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
