import mongoose, { Document } from 'mongoose';
export interface IResume extends Document {
    userId: mongoose.Types.ObjectId;
    fileName: string;
    filePath: string;
    parsedData: {
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
    };
    createdAt: Date;
}
declare const _default: mongoose.Model<IResume, {}, {}, {}, mongoose.Document<unknown, {}, IResume, {}, {}> & IResume & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Resume.d.ts.map