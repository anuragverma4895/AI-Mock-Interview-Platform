import { Router } from 'express';
import {
  uploadVideoChunk,
  finalizeVideo,
  getVideoInfo,
  downloadVideo,
  analyzeBodyLanguage,
} from '../controllers/videoController';
import { auth } from '../middleware/auth';
import { videoUpload } from '../middleware/upload';

const router = Router();

router.post('/upload-chunk', auth, videoUpload.single('chunk'), uploadVideoChunk);
router.post('/finalize', auth, finalizeVideo);
router.get('/:id', auth, getVideoInfo);
router.get('/:id/download', auth, downloadVideo);
router.post('/analyze-body-language', auth, analyzeBodyLanguage);

export default router;