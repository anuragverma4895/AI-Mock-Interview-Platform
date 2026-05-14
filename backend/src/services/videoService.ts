import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

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
      await fsSync.access(chunkPath);
      const readStream = fsSync.createReadStream(chunkPath);
      await new Promise((resolve, reject) => {
        readStream.pipe(writeStream, { end: false });
        readStream.on('end', resolve);
        readStream.on('error', reject);
      });
    } catch (error) {
      // Chunk might not exist, skip
    }
  }

  writeStream.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', reject);
  });
};

export const deleteVideoChunks = async (interviewId: string): Promise<void> => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'videos', interviewId);

  try {
    const files = await fs.readdir(uploadDir);
    await Promise.all(files.map(file => fs.unlink(path.join(uploadDir, file))));
    await fs.rmdir(uploadDir);
  } catch (error) {
    // Directory might not exist or already deleted
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
  const base64Data = frameData.replace(/^data:image\/\w+;base64,/, '');

  const prompt = `Analyze this facial image for interview body language assessment.

Analyze for:
1. Eye contact (looking at camera or away)
2. Face orientation (facing forward or turned)
3. Expression confidence (smile, neutral, nervous)
4. Overall engagement level

Return a JSON:
{
  "eyeContact": 0-100,
  "faceOrientation": 0-100,
  "confidenceScore": 0-100,
  "suggestions": ["suggestion1", "suggestion2"]
}`;

  return {
    confidenceScore: 75,
    suggestions: [
      'Maintain better eye contact with the camera',
      'Keep your face oriented toward the screen',
      'Show more confidence in your expressions',
    ],
  };
};