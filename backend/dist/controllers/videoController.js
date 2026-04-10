"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeBodyLanguage = exports.downloadVideo = exports.getVideoInfo = exports.finalizeVideo = exports.uploadVideoChunk = void 0;
const fs_1 = __importDefault(require("fs"));
const Interview_1 = __importDefault(require("../models/Interview"));
const videoService_1 = require("../services/videoService");
const uploadVideoChunk = async (req, res) => {
    try {
        const { interviewId, chunkIndex } = req.body;
        if (!req.file) {
            res.status(400).json({ message: 'No video chunk provided' });
            return;
        }
        await (0, videoService_1.saveVideoChunk)(interviewId, req.file.buffer, parseInt(chunkIndex));
        res.json({ message: 'Video chunk uploaded', chunkIndex });
    }
    catch (error) {
        console.error('Error uploading video chunk:', error);
        res.status(500).json({ message: 'Error uploading video chunk', error: String(error) });
    }
};
exports.uploadVideoChunk = uploadVideoChunk;
const finalizeVideo = async (req, res) => {
    try {
        const { interviewId, totalChunks } = req.body;
        const videoPath = await (0, videoService_1.combineVideoChunks)(interviewId, parseInt(totalChunks));
        const interview = await Interview_1.default.findById(interviewId);
        if (interview) {
            interview.videoPath = videoPath;
            await interview.save();
        }
        res.json({ message: 'Video finalized', videoPath });
    }
    catch (error) {
        console.error('Error finalizing video:', error);
        res.status(500).json({ message: 'Error finalizing video', error: String(error) });
    }
};
exports.finalizeVideo = finalizeVideo;
const getVideoInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview_1.default.findById(id);
        if (!interview || !interview.videoPath) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }
        res.json({
            exists: fs_1.default.existsSync(interview.videoPath),
            path: interview.videoPath,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error getting video info', error: String(error) });
    }
};
exports.getVideoInfo = getVideoInfo;
const downloadVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview_1.default.findById(id);
        if (!interview || !interview.videoPath) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }
        if (!fs_1.default.existsSync(interview.videoPath)) {
            res.status(404).json({ message: 'Video file not found on server' });
            return;
        }
        res.download(interview.videoPath, `interview-${id}.webm`);
    }
    catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({ message: 'Error downloading video', error: String(error) });
    }
};
exports.downloadVideo = downloadVideo;
const analyzeBodyLanguage = async (req, res) => {
    try {
        const { frameData } = req.body;
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
    }
    catch (error) {
        console.error('Error analyzing body language:', error);
        res.status(500).json({ message: 'Error analyzing body language', error: String(error) });
    }
};
exports.analyzeBodyLanguage = analyzeBodyLanguage;
//# sourceMappingURL=videoController.js.map