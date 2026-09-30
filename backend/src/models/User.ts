import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  role: string;
  profileImage?: string;
  googleDriveConnected: boolean;
  googleDriveRefreshToken?: string;  // Stored encrypted (AES-256-GCM)
  googleDriveFolderId?: string;
  googleDriveConnectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'candidate',
      enum: ['candidate', 'interviewer', 'admin'],
    },
    profileImage: {
      type: String,
    },
    googleDriveConnected: {
      type: Boolean,
      default: false,
    },
    googleDriveRefreshToken: {
      type: String,
      select: false,  // Never returned in normal queries
    },
    googleDriveFolderId: {
      type: String,
    },
    googleDriveConnectedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);