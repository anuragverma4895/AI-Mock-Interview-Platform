import fs from 'fs';
import path from 'path';

export const saveVideoChunk = async (
  interviewId: string,
  chunk: Buffer,
  chunkIndex: number
): Promise<string> => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'videos', interviewId);
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const chunkPath = path.join(uploadDir, `chunk-${chunkIndex}.webm`);
  fs.writeFileSync(chunkPath, chunk);
  
  return chunkPath;
};

export const combineVideoChunks = async (
  interviewId: string,
  totalChunks: number
): Promise<string> => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'videos', interviewId);
  const outputPath = path.join(uploadDir, `${interviewId}.webm`);

  const writeStream = fs.createWriteStream(outputPath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(uploadDir, `chunk-${i}.webm`);
    if (fs.existsSync(chunkPath)) {
      const chunk = fs.readFileSync(chunkPath);
      writeStream.write(chunk);
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
  
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    for (const file of files) {
      fs.unlinkSync(path.join(uploadDir, file));
    }
    fs.rmdirSync(uploadDir);
  }
};

export const getVideoPath = (interviewId: string): string => {
  return path.join(process.cwd(), 'uploads', 'videos', `${interviewId}.webm`);
};

export const videoExists = (interviewId: string): boolean => {
  const videoPath = getVideoPath(interviewId);
  return fs.existsSync(videoPath);
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