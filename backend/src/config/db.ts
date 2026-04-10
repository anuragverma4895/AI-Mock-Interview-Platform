import mongoose from 'mongoose';
<<<<<<< HEAD
import config from './index';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
=======

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interview');
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;