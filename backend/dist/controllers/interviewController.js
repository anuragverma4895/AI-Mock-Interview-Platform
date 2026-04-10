"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTranscript = exports.getUserInterviews = exports.getInterview = exports.endInterview = exports.askFollowUp = exports.submitAnswer = exports.getNextQuestion = exports.startInterview = void 0;
const Interview_1 = __importDefault(require("../models/Interview"));
const Resume_1 = __importDefault(require("../models/Resume"));
const aiService_1 = require("../services/aiService");
const QUESTION_CATEGORIES = ['DSA', 'SystemDesign', 'DB', 'HR', 'Project'];
const MAX_QUESTIONS = 10;
const startInterview = async (req, res) => {
    try {
        const { resumeId, duration } = req.body;
        let resumeData = null;
        if (resumeId) {
            const resume = await Resume_1.default.findById(resumeId);
            if (resume) {
                resumeData = resume.parsedData;
            }
        }
        const firstCategory = QUESTION_CATEGORIES[0];
        const firstQuestion = await (0, aiService_1.generateInterviewQuestion)(firstCategory, 'easy', [], resumeData?.skills, resumeData?.projects?.map(p => p.name));
        const interview = new Interview_1.default({
            userId: req.user?.id,
            resumeId: resumeId || undefined,
            status: 'in_progress',
            questions: [{
                    question: firstQuestion.question,
                    category: firstQuestion.category,
                    difficulty: firstQuestion.difficulty,
                    idealAnswer: firstQuestion.idealAnswer,
                }],
            currentQuestionIndex: 0,
            transcript: [{
                    question: firstQuestion.question,
                    answer: '',
                    timestamp: new Date(),
                }],
            duration: duration || 45,
            startedAt: new Date(),
        });
        await interview.save();
        const greeting = await (0, aiService_1.getGreeting)(req.user?.name);
        res.status(201).json({
            message: 'Interview started',
            greeting,
            interview: {
                id: interview._id,
                status: interview.status,
                currentQuestion: interview.questions[0],
                currentQuestionIndex: interview.currentQuestionIndex,
                totalQuestions: MAX_QUESTIONS,
                duration: interview.duration,
            },
        });
    }
    catch (error) {
        console.error('Error starting interview:', error);
        res.status(500).json({ message: 'Error starting interview', error: String(error) });
    }
};
exports.startInterview = startInterview;
const getNextQuestion = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const interview = await Interview_1.default.findById(interviewId);
        if (!interview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }
        if (interview.status === 'completed') {
            res.status(400).json({ message: 'Interview already completed' });
            return;
        }
        if (interview.currentQuestionIndex >= MAX_QUESTIONS - 1) {
            res.status(400).json({ message: 'Maximum questions reached' });
            return;
        }
        let resumeData = null;
        if (interview.resumeId) {
            const resume = await Resume_1.default.findById(interview.resumeId);
            if (resume)
                resumeData = resume.parsedData;
        }
        const conversationHistory = interview.transcript.map(t => ({
            role: t.answer ? 'user' : 'assistant',
            content: t.answer || t.question,
            timestamp: new Date(t.timestamp)
        }));
        const category = QUESTION_CATEGORIES[(interview.currentQuestionIndex + 1) % QUESTION_CATEGORIES.length];
        const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
        const newQuestion = await (0, aiService_1.generateInterviewQuestion)(category, difficulty, conversationHistory, resumeData?.skills, resumeData?.projects?.map(p => p.name));
        interview.questions.push({
            question: newQuestion.question,
            category: newQuestion.category,
            difficulty: newQuestion.difficulty,
            idealAnswer: newQuestion.idealAnswer,
        });
        interview.transcript.push({
            question: newQuestion.question,
            answer: '',
            timestamp: new Date(),
        });
        interview.currentQuestionIndex += 1;
        await interview.save();
        res.json({
            question: interview.questions[interview.currentQuestionIndex],
            currentIndex: interview.currentQuestionIndex,
            totalQuestions: MAX_QUESTIONS,
        });
    }
    catch (error) {
        console.error('Error getting next question:', error);
        res.status(500).json({ message: 'Error getting next question', error: String(error) });
    }
};
exports.getNextQuestion = getNextQuestion;
const submitAnswer = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { answer } = req.body;
        const interview = await Interview_1.default.findById(interviewId);
        if (!interview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }
        if (interview.status === 'completed') {
            res.status(400).json({ message: 'Interview already completed' });
            return;
        }
        const currentQuestion = interview.questions[interview.currentQuestionIndex];
        const conversationHistory = interview.transcript.map(t => ({
            role: t.answer ? 'user' : 'assistant',
            content: t.answer || t.question,
            timestamp: new Date(t.timestamp)
        }));
        const evaluation = await (0, aiService_1.evaluateAnswer)(currentQuestion.question, answer, currentQuestion.category, currentQuestion.difficulty, conversationHistory, currentQuestion.idealAnswer);
        interview.questions[interview.currentQuestionIndex].answer = answer;
        interview.questions[interview.currentQuestionIndex].score = evaluation.score;
        interview.questions[interview.currentQuestionIndex].feedback = evaluation.feedback;
        const transcriptIdx = interview.transcript.findIndex((_, i) => interview.questions[interview.currentQuestionIndex].question === interview.transcript[i].question);
        if (transcriptIdx >= 0) {
            interview.transcript[transcriptIdx].answer = answer;
        }
        await interview.save();
        res.json({
            evaluation: {
                score: evaluation.score,
                feedback: evaluation.feedback,
                strengths: evaluation.strengths,
                improvements: evaluation.improvements,
                idealAnswer: evaluation.idealAnswer,
                followUpQuestion: evaluation.followUpQuestion,
            },
            currentIndex: interview.currentQuestionIndex,
            totalQuestions: MAX_QUESTIONS,
            isLastQuestion: interview.currentQuestionIndex >= MAX_QUESTIONS - 1,
        });
    }
    catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ message: 'Error submitting answer', error: String(error) });
    }
};
exports.submitAnswer = submitAnswer;
const askFollowUp = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { answer } = req.body;
        const interview = await Interview_1.default.findById(interviewId);
        if (!interview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }
        const currentQuestion = interview.questions[interview.currentQuestionIndex];
        const conversationHistory = interview.transcript.map(t => ({
            role: t.answer ? 'user' : 'assistant',
            content: t.answer || t.question,
            timestamp: new Date(t.timestamp)
        }));
        const followUp = await (0, aiService_1.generateFollowUpQuestion)(currentQuestion.question, answer || currentQuestion.answer || '', currentQuestion.category, conversationHistory);
        res.json({ followUpQuestion: followUp });
    }
    catch (error) {
        console.error('Error generating follow-up:', error);
        res.status(500).json({ message: 'Error generating follow-up', error: String(error) });
    }
};
exports.askFollowUp = askFollowUp;
const endInterview = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { videoPath, bodyLanguageData } = req.body;
        const interview = await Interview_1.default.findById(interviewId);
        if (!interview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }
        interview.status = 'completed';
        interview.completedAt = new Date();
        if (videoPath)
            interview.videoPath = videoPath;
        if (bodyLanguageData)
            interview.bodyLanguageData = bodyLanguageData;
        const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
        interview.finalScore = totalScore / interview.questions.length;
        const strongAreas = interview.questions
            .filter(q => (q.score || 0) >= 4)
            .map(q => q.category);
        const improvements = interview.questions
            .filter(q => (q.score || 0) < 3)
            .map(q => q.category);
        const closingMessage = await (0, aiService_1.getClosingMessage)(interview.finalScore, [...new Set(strongAreas)], [...new Set(improvements)]);
        await interview.save();
        res.json({
            message: 'Interview completed',
            closingMessage,
            interview: {
                id: interview._id,
                status: interview.status,
                finalScore: interview.finalScore,
                questionsCount: interview.questions.length,
                completedAt: interview.completedAt,
            },
        });
    }
    catch (error) {
        console.error('Error ending interview:', error);
        res.status(500).json({ message: 'Error ending interview', error: String(error) });
    }
};
exports.endInterview = endInterview;
const getInterview = async (req, res) => {
    try {
        const interview = await Interview_1.default.findById(req.params.id).populate('resumeId');
        if (!interview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }
        res.json(interview);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching interview', error: String(error) });
    }
};
exports.getInterview = getInterview;
const getUserInterviews = async (req, res) => {
    try {
        const interviews = await Interview_1.default.find({ userId: req.user?.id })
            .populate('resumeId')
            .sort({ createdAt: -1 });
        res.json(interviews);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching interviews', error: String(error) });
    }
};
exports.getUserInterviews = getUserInterviews;
const getTranscript = async (req, res) => {
    try {
        const interview = await Interview_1.default.findById(req.params.id);
        if (!interview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }
        res.json({
            transcript: interview.transcript,
            questions: interview.questions,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching transcript', error: String(error) });
    }
};
exports.getTranscript = getTranscript;
//# sourceMappingURL=interviewController.js.map