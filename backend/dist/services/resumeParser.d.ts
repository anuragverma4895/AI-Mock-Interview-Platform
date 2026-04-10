export interface ParsedResume {
    skills: string[];
    projects: Array<{
        name: string;
        description: string;
    }>;
    experience: Array<{
        company: string;
        role: string;
        duration: string;
    }>;
}
export declare const parseResume: (filePath: string) => Promise<ParsedResume>;
//# sourceMappingURL=resumeParser.d.ts.map