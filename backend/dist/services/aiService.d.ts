export interface GeneratedQuestion {
    question: string;
    category: string;
    difficulty: string;
    idealAnswer: string;
}
export interface AnswerEvaluation {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    idealAnswer: string;
    followUpQuestion?: string;
}
export declare const generateInterviewQuestion: (category: string, difficulty: string, conversationHistory?: any[], resumeSkills?: string[], projectNames?: string[]) => Promise<GeneratedQuestion>;
export declare const evaluateAnswer: (question: string, answer: string, category: string, difficulty: string, conversationHistory?: any[], idealAnswer?: string) => Promise<AnswerEvaluation>;
export declare const generateFollowUpQuestion: (previousQuestion: string, previousAnswer: string, category: string, conversationHistory?: any[]) => Promise<string>;
export declare const getGreeting: (candidateName?: string) => Promise<string>;
export declare const getClosingMessage: (finalScore: number, strongAreas: string[], improvements: string[]) => Promise<string>;
export declare const generateImage: (prompt: string) => Promise<string>;
export declare const generateVideo: (prompt: string) => Promise<string>;
export declare const generateFinalReport: (questions: any[], bodyLanguageData?: any) => Promise<string>;
//# sourceMappingURL=aiService.d.ts.map