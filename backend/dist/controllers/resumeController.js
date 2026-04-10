"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResume = exports.getUserResumes = exports.getResume = exports.uploadResume = void 0;
const Resume_1 = __importDefault(require("../models/Resume"));
const resumeParser_1 = require("../services/resumeParser");
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const parsedData = await (0, resumeParser_1.parseResume)(req.file.path);
        const resume = new Resume_1.default({
            userId: req.user?.id,
            fileName: req.file.originalname,
            filePath: req.file.path,
            parsedData,
        });
        await resume.save();
        res.status(201).json({
            message: 'Resume uploaded successfully',
            resume: {
                id: resume._id,
                fileName: resume.fileName,
                parsedData: resume.parsedData,
                createdAt: resume.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ message: 'Error uploading resume', error: String(error) });
    }
};
exports.uploadResume = uploadResume;
const getResume = async (req, res) => {
    try {
        const resume = await Resume_1.default.findById(req.params.id);
        if (!resume) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }
        res.json(resume);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching resume', error: String(error) });
    }
};
exports.getResume = getResume;
const getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume_1.default.find({ userId: req.user?.id }).sort({ createdAt: -1 });
        res.json(resumes);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching resumes', error: String(error) });
    }
};
exports.getUserResumes = getUserResumes;
const deleteResume = async (req, res) => {
    try {
        const resume = await Resume_1.default.findOne({ _id: req.params.id, userId: req.user?.id });
        if (!resume) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }
        await Resume_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resume deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting resume', error: String(error) });
    }
};
exports.deleteResume = deleteResume;
//# sourceMappingURL=resumeController.js.map