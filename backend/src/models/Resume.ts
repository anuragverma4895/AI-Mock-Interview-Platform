import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  filePath: string;
  parsedData: {
    skills: string[];
    projects: Array<{ name: string; description: string }>;
    experience: Array<{ company: string; role: string; duration: string }>;
  };
  createdAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
<<<<<<< HEAD
      index: true,
=======
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    parsedData: {
      skills: [String],
      projects: [
        {
          name: String,
          description: String,
        },
      ],
      experience: [
        {
          company: String,
          role: String,
          duration: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IResume>('Resume', resumeSchema);