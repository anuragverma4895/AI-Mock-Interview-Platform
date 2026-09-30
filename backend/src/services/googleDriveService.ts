import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import fs from 'fs';
import config from '../config';
import User from '../models/User';

// ── Token Encryption (AES-256-GCM) ──

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Derive a consistent 32-byte key from the config's encryption key.
 */
const getEncryptionKey = (): Buffer => {
  return crypto.scryptSync(config.tokenEncryptionKey, 'prepverse-salt', 32);
};

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns: iv:authTag:ciphertext (all hex-encoded, colon-separated)
 */
export const encryptToken = (plaintext: string): string => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt a token encrypted with encryptToken.
 */
export const decryptToken = (encryptedStr: string): string => {
  const key = getEncryptionKey();
  const parts = encryptedStr.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted token format');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// ── OAuth2 Client for Drive ──

/**
 * Create an OAuth2 client configured for Drive operations.
 * Reuses the same Google Client ID/Secret as the auth flow.
 */
export const createDriveOAuth2Client = (): OAuth2Client => {
  return new OAuth2Client(
    config.googleClientId,
    config.googleClientSecret,
    config.googleDriveRedirectUri
  );
};

/**
 * Generate the Drive authorization URL with drive.file scope.
 * Uses a separate redirect URI so it doesn't conflict with the login flow.
 */
export const generateDriveAuthUrl = (state: string): string => {
  const client = createDriveOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
    state,
    prompt: 'consent',  // Always show consent to ensure we get a refresh token
  });
};

/**
 * Exchange an authorization code for tokens.
 * Returns the refresh_token (needed for offline access).
 */
export const exchangeDriveCode = async (code: string): Promise<{ refreshToken: string; accessToken: string }> => {
  const client = createDriveOAuth2Client();
  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error('No refresh token received. User may need to re-authorize with prompt=consent.');
  }

  return {
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token || '',
  };
};

/**
 * Get an authenticated Drive client for a specific user.
 * Retrieves and decrypts the user's stored refresh token.
 */
export const getDriveClientForUser = async (userId: string): Promise<{ drive: drive_v3.Drive; oauth2Client: OAuth2Client }> => {
  const user = await User.findById(userId).select('+googleDriveRefreshToken');
  if (!user) throw new Error('User not found');
  if (!user.googleDriveConnected || !user.googleDriveRefreshToken) {
    throw new Error('Google Drive is not connected for this user');
  }

  const refreshToken = decryptToken(user.googleDriveRefreshToken);
  const oauth2Client = createDriveOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  return { drive, oauth2Client };
};

// ── Folder Management ──

const APP_FOLDER_NAME = 'PrepVerse';
const RECORDINGS_FOLDER_NAME = 'Interview Recordings';

/**
 * Find or create the application folder structure in the user's Drive.
 * Creates: PrepVerse / Interview Recordings
 * Returns the "Interview Recordings" folder ID.
 */
export const getOrCreateRecordingsFolder = async (drive: drive_v3.Drive, userId: string): Promise<string> => {
  // Check if user already has a cached folder ID
  const user = await User.findById(userId);
  if (user?.googleDriveFolderId) {
    // Verify the folder still exists
    try {
      const existing = await drive.files.get({
        fileId: user.googleDriveFolderId,
        fields: 'id,trashed',
      });
      if (existing.data.id && !existing.data.trashed) {
        return user.googleDriveFolderId;
      }
    } catch {
      // Folder no longer exists, recreate
    }
  }

  // Find or create "PrepVerse" root folder
  const appFolderId = await findOrCreateFolder(drive, APP_FOLDER_NAME, 'root');

  // Find or create "Interview Recordings" inside "PrepVerse"
  const recordingsFolderId = await findOrCreateFolder(drive, RECORDINGS_FOLDER_NAME, appFolderId);

  // Cache the folder ID
  await User.findByIdAndUpdate(userId, { googleDriveFolderId: recordingsFolderId });

  return recordingsFolderId;
};

/**
 * Find a folder by name inside a parent, or create it.
 */
const findOrCreateFolder = async (drive: drive_v3.Drive, name: string, parentId: string): Promise<string> => {
  // Search for existing folder
  const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
  const res = await drive.files.list({
    q: query,
    fields: 'files(id,name)',
    spaces: 'drive',
  });

  if (res.data.files && res.data.files.length > 0 && res.data.files[0].id) {
    return res.data.files[0].id;
  }

  // Create the folder
  const createRes = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });

  if (!createRes.data.id) {
    throw new Error(`Failed to create folder "${name}"`);
  }

  return createRes.data.id;
};

// ── File Upload ──

/**
 * Upload a video buffer to the user's Google Drive.
 * Uses resumable upload for large files.
 */
export const uploadVideoToDrive = async (
  drive: drive_v3.Drive,
  folderId: string,
  fileName: string,
  filePath: string,
  mimeType: string = 'video/webm'
): Promise<{ fileId: string; fileName: string }> => {
  // Use a file stream instead of loading the entire recording into RAM.
  // googleapis creates a resumable upload session when resumable=true, which is
  // important for large interview recordings and transient network failures.
  const res = await drive.files.create(
    {
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType,
      },
      media: {
        mimeType,
        body: fs.createReadStream(filePath),
      },
      fields: 'id,name',
    },
    {
      resumable: true,
      chunkSize: 8 * 1024 * 1024,
    }
  );

  if (!res.data.id) {
    throw new Error('Drive upload failed — no file ID returned');
  }

  return {
    fileId: res.data.id,
    fileName: res.data.name || fileName,
  };
};

// ── File Streaming ──

/**
 * Get a readable stream for a Drive file.
 * Used for streaming video playback through our backend.
 */
export const getDriveFileStream = async (
  drive: drive_v3.Drive,
  fileId: string,
  range?: { start: number; end?: number }
): Promise<{ stream: NodeJS.ReadableStream; fileSize: number; mimeType: string }> => {
  // First, get file metadata for size and type
  const meta = await drive.files.get({
    fileId,
    fields: 'id,size,mimeType',
  });

  const fileSize = parseInt(meta.data.size || '0', 10);
  const mimeType = meta.data.mimeType || 'video/webm';

  // Prepare headers for range request
  const headers: Record<string, string> = {};
  if (range) {
    const end = range.end ?? fileSize - 1;
    headers['Range'] = `bytes=${range.start}-${end}`;
  }

  // Download the file (or a range of it)
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream', headers }
  );

  return {
    stream: res.data as unknown as NodeJS.ReadableStream,
    fileSize,
    mimeType,
  };
};

// ── File Metadata ──

/**
 * Get metadata for a Drive file.
 */
export const getDriveFileMetadata = async (
  drive: drive_v3.Drive,
  fileId: string
): Promise<{ id: string; name: string; size: number; mimeType: string } | null> => {
  try {
    const res = await drive.files.get({
      fileId,
      fields: 'id,name,size,mimeType,trashed',
    });

    if (!res.data.id || res.data.trashed) return null;

    return {
      id: res.data.id,
      name: res.data.name || '',
      size: parseInt(res.data.size || '0', 10),
      mimeType: res.data.mimeType || 'video/webm',
    };
  } catch {
    return null;
  }
};

// ── File Delete ──

/**
 * Delete a file from Drive.
 */
export const deleteDriveFile = async (drive: drive_v3.Drive, fileId: string): Promise<void> => {
  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error('Drive file delete failed:', error);
    // Don't throw — deletion failure shouldn't block other operations
  }
};

// ── Playback Tokens ──

/**
 * Generate a short-lived playback token for video streaming.
 * Token expires after 5 minutes.
 */
export const generatePlaybackToken = (interviewId: string, userId: string): string => {
  const payload = {
    interviewId,
    userId,
    exp: Date.now() + 5 * 60 * 1000,  // 5 minutes
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const json = JSON.stringify(payload);
  return encryptToken(json);
};

/**
 * Validate and decode a playback token.
 * Returns null if expired or invalid.
 */
export const validatePlaybackToken = (token: string): { interviewId: string; userId: string } | null => {
  try {
    const json = decryptToken(token);
    const payload = JSON.parse(json);
    if (Date.now() > payload.exp) return null;
    return { interviewId: payload.interviewId, userId: payload.userId };
  } catch {
    return null;
  }
};
