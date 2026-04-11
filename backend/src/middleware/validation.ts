import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Validation rules for auth
export const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').optional().isIn(['candidate', 'interviewer', 'admin']).withMessage('Invalid role'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required'),
  handleValidationErrors,
];

// Validation rules for resume
export const validateResumeId = [
  param('id').isMongoId().withMessage('Invalid resume ID'),
  handleValidationErrors,
];

export const validateUserId = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  handleValidationErrors,
];

// Validation rules for interview
export const validateInterviewId = [
  param('interviewId').isMongoId().withMessage('Invalid interview ID'),
  handleValidationErrors,
];

// For routes that use :id instead of :interviewId
export const validateId = [
  param('id').isMongoId().withMessage('Invalid ID'),
  handleValidationErrors,
];

export const validateSubmitAnswer = [
  body('answer').trim().isLength({ min: 1 }).withMessage('Answer is required'),
  handleValidationErrors,
];

// Validation rules for analytics
export const validateAnalyticsUserId = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  handleValidationErrors,
];

export const validateInterviewAnalyticsId = [
  param('id').isMongoId().withMessage('Invalid interview ID'),
  handleValidationErrors,
];