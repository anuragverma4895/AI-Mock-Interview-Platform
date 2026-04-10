"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Interview_1 = __importDefault(require("../models/Interview"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/:userId', auth_1.auth, async (req, res) => {
    try {
        const interviews = await Interview_1.default.find({ userId: req.params.userId, status: 'completed' })
            .sort({ createdAt: -1 });
        if (interviews.length === 0) {
            res.json({
                totalInterviews: 0,
                averageScore: 0,
                scoreTrends: [],
                weakAreas: [],
                strongAreas: [],
                recentInterviews: [],
            });
            return;
        }
        const totalScore = interviews.reduce((sum, i) => sum + (i.finalScore || 0), 0);
        const averageScore = totalScore / interviews.length;
        const scoreTrends = interviews.slice(0, 10).map(i => ({
            date: i.completedAt,
            score: i.finalScore,
        }));
        const categoryScores = {};
        const categoryCounts = {};
        for (const interview of interviews) {
            for (const question of interview.questions) {
                const category = question.category;
                if (!categoryScores[category]) {
                    categoryScores[category] = [];
                    categoryCounts[category] = 0;
                }
                if (question.score !== undefined) {
                    categoryScores[category].push(question.score);
                    categoryCounts[category]++;
                }
            }
        }
        const weakAreas = [];
        const strongAreas = [];
        for (const [category, scores] of Object.entries(categoryScores)) {
            if (scores.length > 0) {
                const avgCategoryScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                if (avgCategoryScore < 3) {
                    weakAreas.push(category);
                }
                else if (avgCategoryScore >= 4) {
                    strongAreas.push(category);
                }
            }
        }
        const recentInterviews = interviews.slice(0, 5).map(i => ({
            id: i._id,
            date: i.completedAt,
            finalScore: i.finalScore,
            questionCount: i.questions.length,
        }));
        res.json({
            totalInterviews: interviews.length,
            averageScore: Math.round(averageScore * 10) / 10,
            scoreTrends,
            weakAreas,
            strongAreas,
            recentInterviews,
        });
    }
    catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics', error: String(error) });
    }
});
router.get('/interview/:id', auth_1.auth, async (req, res) => {
    try {
        const interview = await Interview_1.default.findById(req.params.id);
        if (!interview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }
        const questionsByCategory = {};
        for (const question of interview.questions) {
            const category = question.category;
            if (!questionsByCategory[category]) {
                questionsByCategory[category] = { total: 0, avgScore: 0 };
            }
            questionsByCategory[category].total++;
            if (question.score !== undefined) {
                questionsByCategory[category].avgScore += question.score;
            }
        }
        for (const category of Object.keys(questionsByCategory)) {
            const data = questionsByCategory[category];
            data.avgScore = Math.round((data.avgScore / data.total) * 10) / 10;
        }
        res.json({
            interviewId: interview._id,
            finalScore: interview.finalScore,
            totalQuestions: interview.questions.length,
            questionsByCategory,
            bodyLanguage: interview.bodyLanguageData,
            duration: interview.duration,
        });
    }
    catch (error) {
        console.error('Error fetching interview analytics:', error);
        res.status(500).json({ message: 'Error fetching interview analytics', error: String(error) });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map