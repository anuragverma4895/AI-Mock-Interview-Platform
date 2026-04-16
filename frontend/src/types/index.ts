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
  idealAnswer?: string;
}

export interface Interview {
  _id: string;
  id?: string;
  userId: string;
  resumeId?: string;
  status: 'pending' | 'in_progress' | 'completed';
  role: 'technical' | 'hr' | 'combine';
  difficulty: 'easy' | 'medium' | 'hard';
  jobRole: 'frontend' | 'backend' | 'fullstack' | 'mern' | 'mevn' | 'dse' | 'da' | 'ds' | 'mobile' | 'devops' | 'qa';
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  transcript: Array<{ question: string; answer: string; timestamp: string }>;
  videoPath?: string;
  bodyLanguageData?: {
    eyeContact: number;
    faceOrientation: number;
    confidenceScore: number;
    suggestions: string[];
  };
  finalScore?: number;
  duration: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
  }>;
}