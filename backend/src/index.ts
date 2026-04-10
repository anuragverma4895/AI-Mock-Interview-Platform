import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db';
import config from './config';
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import interviewRoutes from './routes/interview';
import videoRoutes from './routes/video';
import analyticsRoutes from './routes/analytics';
import { errorHandler } from './middleware/errorHandler';
import path from 'path';

// Handle unhandled Promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  console.error(`Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5005'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI Mock Interview Platform API is running',
    port: config.port,
    env: config.nodeEnv,
    dbConnected: !!(require('mongoose').connection.readyState === 1)
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use.`);
    console.error(`Please kill the process using port ${config.port} or change the PORT in your .env file.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

export default app;