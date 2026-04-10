"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resumeController_1 = require("../controllers/resumeController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/upload', auth_1.auth, upload_1.upload.single('resume'), resumeController_1.uploadResume);
router.get('/:id', auth_1.auth, resumeController_1.getResume);
router.get('/user/:userId', auth_1.auth, resumeController_1.getUserResumes);
router.delete('/:id', auth_1.auth, resumeController_1.deleteResume);
exports.default = router;
//# sourceMappingURL=resume.js.map