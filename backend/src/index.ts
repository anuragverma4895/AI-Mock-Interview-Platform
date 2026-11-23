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
import demoRoutes from './routes/demo';
import codingRoutes from './routes/coding';
import { errorHandler } from './middleware/errorHandler';
import path from 'path';
import { rateLimit } from './middleware/rateLimit';

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
// Render places one trusted reverse proxy in front of the Node service.
if (config.nodeEnv === 'production') app.set('trust proxy', 1);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// In production, relax helmet CSP so the SPA can load its own scripts/styles
app.use(helmet({
  contentSecurityPolicy: config.nodeEnv === 'production' && process.env.SERVE_FRONTEND === 'true' ? false : undefined,
}));

// Allow browser cross-origin calls only from configured frontend domains.
const allowedOrigins = config.nodeEnv === 'production'
  ? [process.env.FRONTEND_URL, ...(process.env.CORS_ORIGINS || '').split(',')]
      .filter((value): value is string => !!value && !!value.trim())
      .map(value => value.trim())
  : ['http://localhost:3000', 'http://localhost:5005'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Private uploads must not be available through unauthenticated static routes.

connectDB();

// Basic process-local safeguards; use a shared store when scaling beyond one replica.
app.use('/api/auth', rateLimit(50, 15 * 60 * 1000));
app.use('/api/resume/analyze', rateLimit(20, 60 * 60 * 1000));
app.use('/api/interview/next-question', rateLimit(60, 60 * 60 * 1000));
app.use('/api/interview/submit-answer', rateLimit(70, 60 * 60 * 1000));
app.use('/api/coding/generate', rateLimit(15, 60 * 60 * 1000));
app.use('/api/demo/upload-recording', rateLimit(12, 60 * 60 * 1000));

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/coding', codingRoutes);

// The API-only Render URL is not a frontend. Redirect to the deployed SPA when configured.
app.get('/', (_req, res) => {
  const frontend = process.env.FRONTEND_URL?.trim();
  if (frontend) {
    try {
      const url = new URL(frontend);
      if (url.protocol === 'https:' || (config.nodeEnv !== 'production' && url.protocol === 'http:')) {
        res.redirect(302, url.origin + url.pathname);
        return;
      }
    } catch { /* invalid configured frontend URL; return API information below */ }
  }
  res.json({
    service: 'PrepVerse API',
    status: 'ok',
    message: 'This is the backend API, not the React website. Deploy the frontend static site and set FRONTEND_URL.',
    health: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI Mock Interview Platform API is running',
    port: config.port,
    env: config.nodeEnv,
    dbConnected: !!(require('mongoose').connection.readyState === 1)
  });
});

// ---- Serve Frontend in Production ----
// After npm run build, frontend/dist contains the Vite-built SPA.
// The backend serves it as static files so both run on a single Render service.
const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');

if (config.nodeEnv === 'production' && process.env.SERVE_FRONTEND === 'true') {
  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(frontendDistPath));

  // SPA catch-all: any non-API route returns index.html so React Router works
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  if (config.nodeEnv === 'production' && process.env.SERVE_FRONTEND === 'true') {
    console.log(`Serving frontend from: ${frontendDistPath}`);
  }
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