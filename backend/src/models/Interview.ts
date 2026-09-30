import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewQuestion {
  _id: mongoose.Types.ObjectId;
  question: string;
  category: 'DSA' | 'SystemDesign' | 'DB' | 'HR' | 'Project';
  difficulty: 'easy' | 'medium' | 'hard';
  answer?: string;
  score?: number;
  feedback?: string;
  idealAnswer?: string;
}

export interface ICodingTestCase {
  input: string;
  expectedOutput: string;
}

export interface ICodingChallenge {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  language: string;
  starterCode: string;
  starterCodes?: Record<string, string>;
  testCases: ICodingTestCase[];
}

export interface ICodingTestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
}

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId?: mongoose.Types.ObjectId;
  interviewType: 'technical' | 'hr' | 'combine' | 'coding';
  status: 'pending' | 'in_progress' | 'completed';
  questions: IInterviewQuestion[];
  currentQuestionIndex: number;
  codingChallenge?: ICodingChallenge;
  codingResults?: ICodingTestResult[];
  codingPassedCount?: number;
  codingTotalCount?: number;
  transcript: Array<{
    question: string;
    answer: string;
    timestamp: Date;
  }>;
  videoPath?: string;
  recordingUrl?: string;
  recordingPublicId?: string;
  recordingDuration?: number;
  isPublished?: boolean;
  // Google Drive fields
  driveFileId?: string;
  driveFileName?: string;
  driveFolderId?: string;
  driveUploadStatus: 'not_requested' | 'pending' | 'uploading' | 'uploaded' | 'failed' | 'skipped';
  driveUploadError?: string;
  driveUploadedAt?: Date;
  bodyLanguageData?: {
    eyeContact: number;
    faceOrientation: number;
    confidenceScore: number;
    suggestions: string[];
  };
  finalScore?: number;
  duration: number;
  startedAt?: Date;
  completedAt?: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
    },
    interviewType: {
      type: String,
      enum: ['technical', 'hr', 'combine', 'coding'],
      default: 'technical',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
      index: true,
    },
    questions: [
      {
        question: String,
        category: {
          type: String,
          enum: ['DSA', 'SystemDesign', 'DB', 'HR', 'Project'],
        },
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
        },
        answer: String,
        score: Number,
        feedback: String,
        idealAnswer: String,
      },
    ],
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    codingChallenge: {
      title: String,
      description: String,
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
      },
      timeLimit: Number,
      language: String,
      starterCode: String,
      starterCodes: {
        type: Schema.Types.Mixed,
        default: {},
      },
      testCases: [
        {
          input: String,
          expectedOutput: String,
        },
      ],
    },
    codingResults: [
      {
        passed: Boolean,
        input: String,
        expected: String,
        actual: String,
      },
    ],
    codingPassedCount: {
      type: Number,
      default: 0,
    },
    codingTotalCount: {
      type: Number,
      default: 0,
    },
    transcript: [
      {
        question: String,
        answer: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    videoPath: String,
    recordingUrl: String,
    recordingPublicId: String,
    recordingDuration: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    // Google Drive fields
    driveFileId: String,
    driveFileName: String,
    driveFolderId: String,
    driveUploadStatus: {
      type: String,
      enum: ['not_requested', 'pending', 'uploading', 'uploaded', 'failed', 'skipped'],
      default: 'not_requested',
    },
    driveUploadError: String,
    driveUploadedAt: Date,
    bodyLanguageData: {
      eyeContact: Number,
      faceOrientation: Number,
      confidenceScore: Number,
      suggestions: [String],
    },
    finalScore: Number,
    duration: {
      type: Number,
      default: 45,
    },
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Add compound index for userId and status
interviewSchema.index({ userId: 1, status: 1 });

// Static method to find user's recordings (supports both Cloudinary legacy and Google Drive)
interviewSchema.statics.findMyRecordings = function (userId: string) {
  return this.find({
    userId,
    status: 'completed',
    $or: [
      { recordingUrl: { $exists: true, $ne: '' } },
      { driveFileId: { $exists: true, $ne: '' }, driveUploadStatus: 'uploaded' },
    ],
  })
    .select('recordingUrl recordingDuration isPublished finalScore questions completedAt createdAt driveFileId driveFileName driveUploadStatus')
    .sort({ completedAt: -1 });
};

const Interview = mongoose.model<IInterview>('Interview', interviewSchema);

// Attach static type
(Interview as any).findMyRecordings = interviewSchema.statics.findMyRecordings;

export default Interview;
