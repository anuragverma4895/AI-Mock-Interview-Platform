import mongoose, { Document } from 'mongoose';
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
export interface IInterview extends Document {
    userId: mongoose.Types.ObjectId;
    resumeId?: mongoose.Types.ObjectId;
    status: 'pending' | 'in_progress' | 'completed';
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
declare const _default: mongoose.Model<IInterview, {}, {}, {}, mongoose.Document<unknown, {}, IInterview, {}, {}> & IInterview & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Interview.d.ts.map