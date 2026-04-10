import { Router } from 'express';
import { uploadResume, getResume, getUserResumes, deleteResume } from '../controllers/resumeController';
import { auth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
<<<<<<< HEAD
import { validateResumeId, validateUserId } from '../middleware/validation';
import { validateFileContent } from '../middleware/fileValidation';

const router = Router();

router.post('/upload', auth, upload.single('resume'), validateFileContent, uploadResume);
router.get('/:id', auth, validateResumeId, getResume);
router.get('/user/:userId', auth, validateUserId, getUserResumes);
router.delete('/:id', auth, validateResumeId, deleteResume);
=======

const router = Router();

router.post('/upload', auth, upload.single('resume'), uploadResume);
router.get('/:id', auth, getResume);
router.get('/user/:userId', auth, getUserResumes);
router.delete('/:id', auth, deleteResume);
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec

export default router;