import { Router } from 'express';
import {
  uploadVideoChunk,
  finalizeVideo,
  getVideoInfo,
  getVideoStreamUrl,
  analyzeBodyLanguage,
} from '../controllers/videoController';
import { auth } from '../middleware/auth';
import { videoUpload } from '../middleware/upload';
import { validateId } from '../middleware/validation';
import { validateFileContent } from '../middleware/fileValidation';

const router = Router();

router.post('/upload-chunk', auth, videoUpload.single('chunk'), validateFileContent, uploadVideoChunk);
router.post('/finalize', auth, finalizeVideo);
router.get('/:id', auth, validateId, getVideoInfo);
router.get('/:id/stream', auth, validateId, getVideoStreamUrl);
router.post('/analyze-body-language', auth, analyzeBodyLanguage);

export default router;