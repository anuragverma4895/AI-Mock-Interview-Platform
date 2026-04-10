import multer from 'multer';
import path from 'path';
<<<<<<< HEAD
import { fileTypeFromBuffer } from 'file-type';
=======
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

<<<<<<< HEAD
const fileFilter = async (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = ['pdf', 'docx'];

  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
  }

  // For content validation, we'll need to read the file buffer
  // This will be done in a custom middleware after multer
  cb(null, true);
=======
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
  }
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

<<<<<<< HEAD
const videoFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['video/webm', 'video/mp4', 'video/avi', 'video/mov'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid video file type. Only WebM, MP4, AVI, and MOV are allowed.'));
  }
};

=======
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
export const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/videos/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
<<<<<<< HEAD
  fileFilter: videoFileFilter,
=======
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
});