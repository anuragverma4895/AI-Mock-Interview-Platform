import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const saveVideoChunk = async (
  interviewId: string,
  chunk: Buffer,
  chunkIndex: number
): Promise<string> => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'videos', interviewId);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  const chunkPath = path.join(uploadDir, `chunk-${chunkIndex}.webm`);
  await fs.writeFile(chunkPath, chunk);
  
  return chunkPath;
};

export const combineVideoChunks = async (
  interviewId: string,
  totalChunks: number
): Promise<string> => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'videos', interviewId);
  const outputPath = path.join(uploadDir, `${interviewId}.webm`);

  const writeStream = fsSync.createWriteStream(outputPath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(uploadDir, `chunk-${i}.webm`);
    try {
      await fs.access(chunkPath);
      const chunk = await fs.readFile(chunkPath);
      writeStream.write(chunk);
    } catch (error) {
      console.warn(`Chunk ${i} not found for interview ${interviewId}, skipping.`);
    }
  }

  writeStream.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      // Upload to Cloudinary after combining chunks
      uploadVideoToCloudinary(outputPath, interviewId)
        .then(resolve)
        .catch(reject);
    });
    writeStream.on('error', reject);
  });
};

export const uploadVideoToCloudinary = async (
  videoPath: string,
  interviewId: string
): Promise<string> => {
  try {
    console.log(`Uploading video to Cloudinary for interview ${interviewId}`);
    
    const result = await cloudinary.uploader.upload(videoPath, {
      resource_type: 'video',
      public_id: `interview-${interviewId}`,
      folder: 'interview-recordings',
      quality: 'auto',
      fetch_format: 'auto',
      timeout: 60000,
    });

    console.log('Video uploaded to Cloudinary:', result.secure_url);

    // Delete local chunks after successful upload
    const uploadDir = path.dirname(videoPath);
    try {
      const files = await fs.readdir(uploadDir);
      await Promise.all(files.map(file => fs.unlink(path.join(uploadDir, file))));
      await fs.rmdir(uploadDir);
    } catch (error) {
      console.warn('Could not delete local video files:', error);
    }

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
};

export const deleteVideoChunks = async (interviewId: string): Promise<void> => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'videos', interviewId);

  try {
    const exists = fsSync.existsSync(uploadDir);
    if (!exists) return;

    const files = await fs.readdir(uploadDir);
    await Promise.all(files.map(file => fs.unlink(path.join(uploadDir, file))));
    await fs.rmdir(uploadDir);
  } catch (error) {
    console.error('Error deleting video chunks:', error);
  }
};

export const getVideoPath = (interviewId: string): string => {
  return path.join(process.cwd(), 'uploads', 'videos', `${interviewId}.webm`);
};

export const videoExists = async (interviewId: string): Promise<boolean> => {
  const videoPath = getVideoPath(interviewId);
  try {
    await fs.access(videoPath);
    return true;
  } catch {
    return false;
  }
};

export const analyzeBodyLanguage = async (
  frameData: string
): Promise<{ confidenceScore: number; suggestions: string[] }> => {
  // Placeholder for real AI analysis
  return {
    confidenceScore: 75,
    suggestions: [
      'Maintain better eye contact with the camera',
      'Keep your face oriented toward the screen',
      'Show more confidence in your expressions',
    ],
  };
};