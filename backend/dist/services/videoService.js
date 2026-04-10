"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeBodyLanguage = exports.videoExists = exports.getVideoPath = exports.deleteVideoChunks = exports.combineVideoChunks = exports.saveVideoChunk = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const saveVideoChunk = async (interviewId, chunk, chunkIndex) => {
    const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'videos', interviewId);
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    const chunkPath = path_1.default.join(uploadDir, `chunk-${chunkIndex}.webm`);
    fs_1.default.writeFileSync(chunkPath, chunk);
    return chunkPath;
};
exports.saveVideoChunk = saveVideoChunk;
const combineVideoChunks = async (interviewId, totalChunks) => {
    const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'videos', interviewId);
    const outputPath = path_1.default.join(uploadDir, `${interviewId}.webm`);
    const writeStream = fs_1.default.createWriteStream(outputPath);
    for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path_1.default.join(uploadDir, `chunk-${i}.webm`);
        if (fs_1.default.existsSync(chunkPath)) {
            const chunk = fs_1.default.readFileSync(chunkPath);
            writeStream.write(chunk);
        }
    }
    writeStream.end();
    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', reject);
    });
};
exports.combineVideoChunks = combineVideoChunks;
const deleteVideoChunks = async (interviewId) => {
    const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'videos', interviewId);
    if (fs_1.default.existsSync(uploadDir)) {
        const files = fs_1.default.readdirSync(uploadDir);
        for (const file of files) {
            fs_1.default.unlinkSync(path_1.default.join(uploadDir, file));
        }
        fs_1.default.rmdirSync(uploadDir);
    }
};
exports.deleteVideoChunks = deleteVideoChunks;
const getVideoPath = (interviewId) => {
    return path_1.default.join(process.cwd(), 'uploads', 'videos', `${interviewId}.webm`);
};
exports.getVideoPath = getVideoPath;
const videoExists = (interviewId) => {
    const videoPath = (0, exports.getVideoPath)(interviewId);
    return fs_1.default.existsSync(videoPath);
};
exports.videoExists = videoExists;
const analyzeBodyLanguage = async (frameData) => {
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
exports.analyzeBodyLanguage = analyzeBodyLanguage;
//# sourceMappingURL=videoService.js.map