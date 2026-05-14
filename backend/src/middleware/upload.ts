import multer from 'multer';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';

import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = async (req: Request, file: any, cb: any) => {
  const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = ['pdf', 'docx'];

  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
  }

  // For content validation, we'll need to read the file buffer
  // This will be done in a custom middleware after multer
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const videoFileFilter = (req: Request, file: any, cb: any) => {
  const allowedTypes = ['video/webm', 'video/mp4', 'video/avi', 'video/mov'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid video file type. Only WebM, MP4, AVI, and MOV are allowed.'));
  }
};

export const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: any, cb: any) => {
      cb(null, 'uploads/videos/');
    },
    filename: (req: Request, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
});