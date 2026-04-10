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
<<<<<<< HEAD
import { validateInterviewId } from '../middleware/validation';
import { validateFileContent } from '../middleware/fileValidation';

const router = Router();

router.post('/upload-chunk', auth, videoUpload.single('chunk'), validateFileContent, uploadVideoChunk);
router.post('/finalize', auth, finalizeVideo);
router.get('/:id', auth, validateInterviewId, getVideoInfo);
router.get('/:id/download', auth, validateInterviewId, downloadVideo);
=======

const router = Router();

router.post('/upload-chunk', auth, videoUpload.single('chunk'), uploadVideoChunk);
router.post('/finalize', auth, finalizeVideo);
router.get('/:id', auth, getVideoInfo);
router.get('/:id/download', auth, downloadVideo);
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
router.post('/analyze-body-language', auth, analyzeBodyLanguage);

export default router;