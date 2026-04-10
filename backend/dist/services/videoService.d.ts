export declare const saveVideoChunk: (interviewId: string, chunk: Buffer, chunkIndex: number) => Promise<string>;
export declare const combineVideoChunks: (interviewId: string, totalChunks: number) => Promise<string>;
export declare const deleteVideoChunks: (interviewId: string) => Promise<void>;
export declare const getVideoPath: (interviewId: string) => string;
export declare const videoExists: (interviewId: string) => boolean;
export declare const analyzeBodyLanguage: (frameData: string) => Promise<{
    confidenceScore: number;
    suggestions: string[];
}>;
//# sourceMappingURL=videoService.d.ts.map