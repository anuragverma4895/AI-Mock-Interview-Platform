# AI Interview Bot - Complete Full Stack Application

A professional AI-powered interview platform with real-time video recording, live coding environment, and intelligent question generation.

## Features

- **AI-Powered Interviews**: Dynamic question generation based on resume data
- **Video Recording**: WebRTC-based real-time webcam and microphone recording
- **Live Coding Environment**: Monaco Editor with multi-language support (JS, Python, C++)
- **Body Language Analysis**: Face detection and engagement metrics
- **Resume Parsing**: PDF/DOCX parsing to extract skills, projects, and experience
- **Analytics Dashboard**: Score trends, weak areas, and performance tracking
- **Transcript & Replay**: Full interview transcript with Q&A review

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Zustand (State Management)
- Monaco Editor (Code Editor)
- WebRTC (Video/Audio)

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication
- OpenAI API (LLM Integration)

## Project Structure

```
ai-interview-bot/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth & upload middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (AI, Resume Parser, Video)
│   │   └── index.ts        # Main server file
│   ├── uploads/            # File uploads directory
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
├── SPEC.md                 # Technical specification
└── README.md               # This file
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API Key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-interview
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key-here
```

4. Start the backend server:
```bash
npm run dev
```

The server will run at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will run at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resume
- `POST /api/resume/upload` - Upload resume (multipart/form-data)
- `GET /api/resume/:id` - Get resume by ID
- `GET /api/resume/user/:userId` - Get user's resumes
- `DELETE /api/resume/:id` - Delete resume

### Interview
- `POST /api/interview/start` - Start new interview
- `GET /api/interview/next-question/:interviewId` - Get next question
- `POST /api/interview/submit-answer/:interviewId` - Submit answer
- `POST /api/interview/end/:interviewId` - End interview
- `GET /api/interview/:id` - Get interview details
- `GET /api/interview/user/:userId` - Get user's interviews
- `GET /api/interview/transcript/:id` - Get transcript

### Video
- `POST /api/video/upload-chunk` - Upload video chunk
- `POST /api/video/finalize` - Finalize video
- `GET /api/video/:id` - Get video info
- `GET /api/video/:id/download` - Download video
- `POST /api/video/analyze-body-language` - Analyze body language

### Analytics
- `GET /api/analytics/:userId` - Get user analytics
- `GET /api/analytics/interview/:id` - Get interview analytics

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-interview
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-api-key
```

### Customization Variables
```env
{{INTERVIEW_DURATION}} = 45 minutes
{{ROLE}} = "Full Stack Developer"
{{DIFFICULTY}} = "Mixed"
{{MAX_QUESTIONS}} = 15
```

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project on Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

### Backend (Render/Railway)
1. Connect GitHub repository
2. Set environment variables
3. Build command: `npm run build`
4. Start command: `npm start`

### Database (MongoDB Atlas)
1. Create free tier cluster
2. Get connection string
3. Add to backend environment variables

## Security Features

- JWT authentication for protected routes
- Password hashing with bcrypt
- CORS configuration
- Helmet for HTTP security headers
- File type validation for uploads
- Input validation

## License

MIT