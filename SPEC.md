# AI Interview Platform - Technical Specification

## 1. System Architecture

### 1.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │Dashboard│ │Interview│ │ Video   │ │ Coding  │ │Analytics│  │
│  │   Page  │ │  Page   │ │Recorder │ │ Editor  │ │  Page   │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘  │
└───────┼──────────┼──────────┼──────────┼──────────┼──────────────┘
        │          │          │          │          │
        └──────────┴──────────┴──────────┴──────────┘
                              │
                    ┌─────────▼─────────┐
                    │   API Gateway     │
                    │   (Express.js)    │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │ Resume  │          │Interview│          │  Video  │
   │ Service │          │ Service │          │ Service │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   MongoDB      │
                    └────────────────┘
                             │
                    ┌────────▼────────┐
                    │   AI Engine    │
                    │  (OpenAI/Claude)│
                    └────────────────┘
```

### 1.2 Microservices Structure
- **Auth Service**: JWT authentication, user management
- **Resume Service**: PDF/DOCX parsing, skill extraction
- **Interview Service**: Question generation, answer evaluation
- **Video Service**: WebRTC handling, recording, storage
- **Analytics Service**: Score calculation, trend analysis

### 1.3 Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand, Monaco Editor, WebRTC
- **Backend**: Node.js, Express.js, WebSocket, MongoDB (Mongoose)
- **AI**: OpenAI GPT-4 / Claude API
- **Storage**: Local filesystem (development) / AWS S3 (production)
- **Security**: JWT, bcrypt, cors, helmet

## 2. Project Structure

```
ai-interview-bot/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── upload.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Interview.ts
│   │   │   └── Resume.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── interview.ts
│   │   │   ├── resume.ts
│   │   │   └── video.ts
│   │   ├── services/
│   │   │   ├── aiService.ts
│   │   │   ├── resumeParser.ts
│   │   │   └── videoService.ts
│   │   ├── controllers/
│   │   │   ├── interviewController.ts
│   │   │   ├── resumeController.ts
│   │   │   └── videoController.ts
│   │   └── index.ts
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── interview/
│   │   │   ├── video/
│   │   │   └── dashboard/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

## 3. Database Schema

### 3.1 User Model
```typescript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  name: string,
  role: string,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2 Resume Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  fileName: string,
  filePath: string,
  parsedData: {
    skills: string[],
    projects: Array<{ name: string, description: string }>,
    experience: Array<{ company: string, role: string, duration: string }>
  },
  createdAt: Date
}
```

### 3.3 Interview Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  resumeId: ObjectId,
  status: 'pending' | 'in_progress' | 'completed',
  questions: Array<{
    _id: ObjectId,
    question: string,
    category: 'DSA' | 'SystemDesign' | 'DB' | 'HR' | 'Project',
    difficulty: 'easy' | 'medium' | 'hard',
    answer: string,
    score: number,
    feedback: string,
    idealAnswer: string
  }>,
  transcript: Array<{
    question: string,
    answer: string,
    timestamp: Date
  }>,
  videoPath: string,
  bodyLanguageData: {
    eyeContact: number,
    faceOrientation: number,
    confidenceScore: number,
    suggestions: string[]
  },
  finalScore: number,
  duration: number,
  startedAt: Date,
  completedAt: Date
}
```

## 4. API Endpoints

### 4.1 Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### 4.2 Resume
- POST /api/resume/upload - Upload resume (PDF/DOCX)
- GET /api/resume/:id - Get parsed resume
- GET /api/resume/user/:userId - Get user's resumes

### 4.3 Interview
- POST /api/interview/start - Start new interview
- POST /api/interview/next-question - Get next question
- POST /api/interview/submit-answer - Submit answer
- POST /api/interview/end - End interview
- GET /api/interview/:id - Get interview details
- GET /api/interview/user/:userId - Get user's interviews

### 4.4 Video
- POST /api/video/upload - Upload recorded video
- GET /api/video/:id - Get video info
- GET /api/video/:id/download - Download video

### 4.5 Analytics
- GET /api/analytics/:userId - Get user analytics
- GET /api/analytics/interview/:id - Get interview analytics

## 5. AI Interview Engine

### 5.1 Question Generation
- Use resume data to personalize questions
- Categories: DSA, System Design, Database, HR, Project-based
- Adaptive difficulty based on user performance

### 5.2 Answer Evaluation
Criteria:
- Understanding (0-5)
- Approach (0-5)
- Edge cases (0-5)
- Complexity (0-5)
- Communication (0-5)

Output:
- Score (0-5)
- Detailed feedback
- Ideal answer reference
- Improvement suggestions

### 5.3 Prompt Template
```
You are an expert technical interviewer. Evaluate the following answer:

Question: {question}
User's Answer: {answer}
Category: {category}
Difficulty: {difficulty}

Evaluate based on:
1. Understanding of the problem
2. Approach and methodology
3. Edge cases handling
4. Time/space complexity
5. Communication clarity

Provide:
- Score (0-5)
- Detailed feedback
- Ideal answer
- Suggestions for improvement
```

## 6. Video Recording

### 6.1 WebRTC Flow
1. Request camera/microphone permissions
2. Create MediaStream
3. Use MediaRecorder to record chunks
4. Send chunks to backend via WebSocket/API
5. Combine chunks into final video file

### 6.2 Storage
- Save to local uploads folder (development)
- Support AWS S3 integration (production)
- Provide download URL after interview

## 7. Body Language Analysis

### 7.1 Analysis Using face-api.js
- Face detection
- Face landmarks
- Eye tracking
- Face orientation

### 7.2 Metrics
- Eye contact percentage
- Face visibility score
- Engagement level (based on face direction)
- Confidence heuristics

### 7.3 Output
- Confidence score (0-100)
- Behavioral feedback
- Suggestions for improvement

## 8. Configuration Variables

```
{{INTERVIEW_DURATION}} = 45 minutes
{{ROLE}} = "Full Stack Developer"
{{DIFFICULTY}} = "Mixed"
{{MAX_QUESTIONS}} = 15
{{VIDEO_QUALITY}} = "720p"
{{CODE_LANGUAGES}} = ["javascript", "python", "cpp"]
```

## 9. Security

- JWT authentication for all protected routes
- Password hashing with bcrypt
- CORS configuration
- Helmet for HTTP headers
- Input validation with Joi/express-validator
- File type validation for uploads
- Code execution sandbox (Docker/isolated VM)

## 10. Deployment

### Frontend
- Vercel (recommended)
- Netlify alternative

### Backend
- Render
- Railway
- Heroku
- DigitalOcean App Platform

### Database
- MongoDB Atlas (free tier)

### Storage
- Local (development)
- AWS S3 (production)