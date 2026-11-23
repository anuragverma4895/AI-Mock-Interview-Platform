export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Resume {
  _id: string;
  userId: string;
  fileName: string;
  parsedData: {
    skills: string[];
    projects: Array<{ name: string; description: string }>;
    experience: Array<{ company: string; role: string; duration: string }>;
  };
  createdAt: string;
}

export interface InterviewQuestion {
  _id?: string;
  question: string;
  category: 'DSA' | 'SystemDesign' | 'DB' | 'HR' | 'Project';
  difficulty: 'easy' | 'medium' | 'hard';
  answer?: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  followUpQuestion?: string;
  evaluationSource?: 'ai' | 'heuristic';
  idealAnswer?: string;
}

export interface Interview {
  _id: string;
  userId: string;
  resumeId?: string;
  interviewType: 'technical' | 'hr' | 'combine' | 'coding';
  jobRole?: string;
  preferredDifficulty?: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in_progress' | 'completed';
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  codingChallenge?: {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number;
    language: string;
    starterCode: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
  };
  codingResults?: Array<{
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
  }>;
  codingPassedCount?: number;
  codingTotalCount?: number;
  codingEvaluationMethod?: 'browser_js' | 'ai_estimate';
  transcript: Array<{ question: string; answer: string; timestamp: string }>;
  videoPath?: string;
  recordingUrl?: string;
  recordingPublicId?: string;
  recordingDuration?: number;
  isPublished?: boolean;
  bodyLanguageData?: {
    eyeContact: number;
    faceOrientation: number;
    confidenceScore: number;
    suggestions: string[];
  };
  finalScore?: number;
  evaluationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  evaluationStartedAt?: string;
  recordingStatus?: 'none' | 'pending' | 'ready' | 'failed';
  duration: number;
  startedAt?: string;
  completedAt?: string;
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
  followUpQuestion?: string;
}

export interface Analytics {
  totalInterviews: number;
  averageScore: number;
  scoreTrends: Array<{ date: string; score: number }>;
  weakAreas: string[];
  strongAreas: string[];
  recentInterviews: Array<{
    id: string;
    date: string;
    finalScore: number;
    questionCount: number;
    answeredCount?: number;
    hasRecording?: boolean;
    duration?: number;
  }>;
}
