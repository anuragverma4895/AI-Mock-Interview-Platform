import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewQuestion {
  _id?: mongoose.Types.ObjectId;
  question: string;
  category: 'DSA' | 'SystemDesign' | 'DB' | 'HR' | 'Project';
  difficulty: 'easy' | 'medium' | 'hard';
  answer?: string;
  score?: number;
  feedback?: string;
  idealAnswer?: string;
}

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId?: mongoose.Types.ObjectId;
  status: 'pending' | 'in_progress' | 'completed';
  role: 'technical' | 'hr' | 'combine';
  difficulty: 'easy' | 'medium' | 'hard';
  jobRole: 'frontend' | 'backend' | 'fullstack' | 'mern' | 'mevn' | 'dse' | 'da' | 'ds' | 'mobile' | 'devops' | 'qa';
  questions: IInterviewQuestion[];
  currentQuestionIndex: number;
  transcript: Array<{
    question: string;
    answer: string;
    timestamp: Date;
  }>;
  videoPath?: string;
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
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
      index: true,
    },
    role: {
      type: String,
      enum: ['technical', 'hr', 'combine'],
      default: 'technical',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    jobRole: {
      type: String,
      enum: ['frontend', 'backend', 'fullstack', 'mern', 'mevn', 'dse', 'da', 'ds', 'mobile', 'devops', 'qa'],
      default: 'fullstack',
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
    transcript: [
      {
        question: String,
        answer: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    videoPath: String,
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

export default mongoose.model<IInterview>('Interview', interviewSchema);