import { Router } from 'express';
import { uploadResume, getResume, getUserResumes, deleteResume } from '../controllers/resumeController';
import { auth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validateResumeId, validateUserId } from '../middleware/validation';
import { validateFileContent } from '../middleware/fileValidation';

const router = Router();

router.post('/upload', auth, upload.single('resume'), validateFileContent, uploadResume);
router.get('/:id', auth, validateResumeId, getResume);
router.get('/user/:userId', auth, validateUserId, getUserResumes);
router.delete('/:id', auth, validateResumeId, deleteResume);

export default router;