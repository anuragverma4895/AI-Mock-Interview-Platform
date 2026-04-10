"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const videoController_1 = require("../controllers/videoController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/upload-chunk', auth_1.auth, upload_1.videoUpload.single('chunk'), videoController_1.uploadVideoChunk);
router.post('/finalize', auth_1.auth, videoController_1.finalizeVideo);
router.get('/:id', auth_1.auth, videoController_1.getVideoInfo);
router.get('/:id/download', auth_1.auth, videoController_1.downloadVideo);
router.post('/analyze-body-language', auth_1.auth, videoController_1.analyzeBodyLanguage);
exports.default = router;
//# sourceMappingURL=video.js.map