"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interviewController_1 = require("../controllers/interviewController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/start', auth_1.auth, interviewController_1.startInterview);
router.get('/next-question/:interviewId', auth_1.auth, interviewController_1.getNextQuestion);
router.post('/submit-answer/:interviewId', auth_1.auth, interviewController_1.submitAnswer);
router.post('/follow-up/:interviewId', auth_1.auth, interviewController_1.askFollowUp);
router.post('/end/:interviewId', auth_1.auth, interviewController_1.endInterview);
router.get('/:id', auth_1.auth, interviewController_1.getInterview);
router.get('/user/:userId', auth_1.auth, interviewController_1.getUserInterviews);
router.get('/transcript/:id', auth_1.auth, interviewController_1.getTranscript);
exports.default = router;
//# sourceMappingURL=interview.js.map