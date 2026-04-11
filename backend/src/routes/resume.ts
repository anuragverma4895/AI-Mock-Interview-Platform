import { Router } from 'express';
import { uploadResume, getResume, getUserResumes, deleteResume } from '../controllers/resumeController';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validateResumeId } from '../middleware/validation';
import { validateFileContent } from '../middleware/fileValidation';

const router = Router();

router.post('/upload', auth, upload.single('resume'), validateFileContent, uploadResume);
router.get('/user/:userId', auth, getUserResumes);
router.get('/:id', auth, validateResumeId, getResume);
router.delete('/:id', auth, validateResumeId, deleteResume);

export default router;