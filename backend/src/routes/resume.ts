import { Router } from 'express';
import { uploadResume, getResume, getUserResumes, deleteResume } from '../controllers/resumeController';
import { auth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/upload', auth, upload.single('resume'), uploadResume);
router.get('/:id', auth, getResume);
router.get('/user/:userId', auth, getUserResumes);
router.delete('/:id', auth, deleteResume);

export default router;