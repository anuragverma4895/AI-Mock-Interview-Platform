# AI Mock Interview Platform - Complete Full Stack Application

A professional AI-powered interview platform with real-time video recording, live coding environment, and intelligent question generation.

## Features

- **AI-Powered Interviews**: Dynamic question generation based on resume data
- **Video Recording**: WebRTC-based real-time webcam and microphone recording
- **Live Coding Environment**: Monaco Editor with multi-language support (JS, Python, C++)
- **Body Language Analysis**: Face detection and engagement metrics
- **Resume Parsing**: PDF/DOCX parsing to extract skills, projects, and experience
- **Analytics Dashboard**: Score trends, weak areas, and performance tracking
- **Transcript & Replay**: Full interview transcript with Q&A review

## System Architecture & Data Flow

The platform is designed with a highly integrated, multi-modal system architecture. Below is the complete step-by-step execution flowchart showing how all client sub-systems, Express controllers, database models, and cloud APIs interact in real-time.

```mermaid
flowchart TD
    %% Custom Styling
    classDef client fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc
    classDef server fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#f8fafc
    classDef db fill:#020617,stroke:#f59e0b,stroke-width:2px,color:#f8fafc
    classDef ext fill:#0f172a,stroke:#a855f7,stroke-width:2px,color:#f8fafc

    subgraph PHASE1 ["PHASE 1: Resume Upload & Virtual Recruiter Suitability Analysis"]
        direction LR
        P1_FE["ResumeUpload.tsx<br>React File Dropzone"]:::client
        P1_Ctrl["resumeController.ts<br>Express Upload Endpoint"]:::server
        P1_Parser["resumeParser.ts<br>pdf-parse and mammoth"]:::server
        P1_Gemini["Gemini Flash API<br>Suitability Check"]:::ext
        P1_DB["MongoDB Resume Collection<br>Skills, Gaps and Score"]:::db

        P1_FE -->|"1. Upload File"| P1_Ctrl
        P1_Ctrl -->|"2. Extract Text"| P1_Parser
        P1_Parser -->|"3. Suitability Call"| P1_Gemini
        P1_Gemini -->|"4. Score and Gaps JSON"| P1_Parser
        P1_Parser -->|"5. Save parsed resume"| P1_DB
    end

    subgraph PHASE2 ["PHASE 2: Lobby Configuration & Personalized Setup"]
        direction LR
        P2_FE["Dashboard and Lobby UI<br>Role, Difficulty, Toggle Video"]:::client
        P2_Ctrl["interviewController.ts<br>Express Session Start"]:::server
        P2_AI["aiService.ts<br>Interview AI Engine"]:::server
        P2_Gemini["Gemini Flash API<br>Resume-Aware Q1 Generation"]:::ext
        P2_DB["MongoDB Interview Collection<br>Create Stateful Pending Session"]:::db

        P2_FE -->|"6. Config and Start Session"| P2_Ctrl
        P2_Ctrl -->|"7. Fetch Resume Profile"| P2_AI
        P2_AI -->|"8. Generate personalized Q1"| P2_Gemini
        P2_Gemini -->|"9. Return Q1 or 31 bank"| P2_AI
        P2_AI -->|"10. Persist pending session"| P2_DB
    end

    subgraph PHASE3 ["PHASE 3: Active Multi-Modal Q&A Loop ('Alex')"]
        direction LR
        P3_FE["Interview.tsx<br>React AV Canvas Room"]:::client
        P3_TTS["Web Speech TTS<br>Narrate Question"]:::client
        P3_STT["Web Speech STT<br>Continuous Speech-to-Text"]:::client
        P3_MP["MediaPipe CV Tracker<br>Eye Contact and Posture"]:::client
        P3_Ctrl["interviewController.ts<br>Answer Submission"]:::server
        P3_AI["aiService.ts<br>Evaluation and Response Router"]:::server
        P3_Gemini["Gemini Flash API<br>Grades and Contextual Follow-Up Q"]:::ext
        P3_DB["MongoDB Interview Collection<br>Append QA Transcript"]:::db

        P3_FE -->|"12. Speak Question"| P3_TTS
        P3_FE -->|"13. Transcribe Answer"| P3_STT
        P3_FE -->|"14. Capture Behavioral CV"| P3_MP
        P3_STT -->|"15a. Submit Text response"| P3_Ctrl
        P3_MP -->|"15b. Submit CV metrics"| P3_Ctrl
        P3_Ctrl -->|"16. Process Evaluation"| P3_AI
        P3_AI -->|"17. Grade response"| P3_Gemini
        P3_Gemini -->|"18. Strengths and follow-up Q"| P3_AI
        P3_AI -->|"19. Commit QA Details"| P3_DB
        P3_DB -->|"20. Return feedback and next question"| P3_FE
        P3_FE -.->|"21. Loop questions 2 to 10"| P3_FE
    end

    subgraph PHASE4 ["PHASE 4: Session Finalization & Video Archiving"]
        direction LR
        P4_FE["WebRTC Compilation<br>Stop MediaRecorder, Build WebM"]:::client
        P4_Ctrl["videoController.ts<br>Chunked Video Uploader"]:::server
        P4_Cloudinary["cloudinaryService.ts<br>Cloud Storage Driver"]:::server
        P4_CloudAPI["Cloudinary Storage<br>Secure CDN Host"]:::ext
        P4_IntCtrl["interviewController.ts<br>Express Session End"]:::server
        P4_DB["MongoDB Interview Collection<br>Update Status to Completed"]:::db

        P4_FE -->|"23. Stream WebM Chunks"| P4_Ctrl
        P4_Ctrl -->|"24. Push to Cloud CDN"| P4_Cloudinary
        P4_Cloudinary -->|"25. Secure Archiving"| P4_CloudAPI
        P4_CloudAPI -->|"26. Return HTTPS URL"| P4_Cloudinary
        P4_Cloudinary -->|"27. Register Video URL"| P4_IntCtrl
        P4_IntCtrl -->|"28. Mark completed session"| P4_DB
    end

    subgraph PHASE5 ["PHASE 5: Performance Review Dashboard & Replay Review"]
        direction LR
        P5_FE["InterviewResult.tsx<br>React Dashboard Room"]:::client
        P5_Charts["Recharts Visuals<br>Radar, Trajectory Plots"]:::client
        P5_Player["Cloudinary Player<br>Synchronized Replay"]:::client
        P5_Ctrl["interviewController.ts<br>Fetch Session Metrics"]:::server
        P5_DB["MongoDB Collections<br>Retrieve Historical Data"]:::db
        P5_CloudAPI2["Cloudinary CDN<br>Stream Recorded Session"]:::ext

        P5_FE -->|"30. Render Dashboard UI"| P5_Charts
        P5_FE -->|"31. Fetch Performance Data"| P5_Ctrl
        P5_Ctrl -->|"32. Query Records"| P5_DB
        P5_DB -->|"33. Return Analytics JSON"| P5_Ctrl
        P5_Ctrl -->|"34. Load Visuals"| P5_FE
        P5_FE -->|"35. Play Video Replay"| P5_Player
        P5_CloudAPI2 -->|"36. Stream Playback"| P5_Player
    end

    %% Phase-to-Phase Chronological Flows
    P1_DB -->|"11. Load Stats to Dashboard"| P2_FE
    P2_DB -->|"22. Redirect to Room"| P3_FE
    P3_FE -->|"29. Complete Session and WebM compiled"| P4_FE
    P4_DB -->|"37. Redirect Candidate"| P5_FE
```

---

### Step-by-Step Detailed Execution Flow (kya aur kaise chalega)

#### Phase 1: Authentication & Onboarding
1. **User Sign-up/Login:** The candidate hits the registration page. Hashing is done using `bcrypt` on the backend inside `authController.ts` and user profiles are created in `User` MongoDB model. All following backend communication is validated via **JSON Web Tokens (JWT)**.
2. **Resume Upload:** The candidate uploads their resume (PDF or DOCX format) via `ResumeUpload.tsx`.
3. **Parsing & Text Extraction:** The Express API endpoint `/api/resume/upload` receives the file. Inside `resumeParser.ts`, it automatically detects the extension and parses the raw text (`pdf-parse` for PDF, `mammoth` for DOCX).
4. **Intelligent Recruiter Check:** The parser formats the raw data (skills, projects, experience keywords) and queries the **Gemini API** (`gemini-flash-latest`). Gemini calculates a **Suitability Score (0-100)**, identifies specific matched skills, flags critical missing requirements for the target role, and provides tailored profile enhancement tips.
5. **Database Storage:** The parsed text and analysis results are committed to MongoDB under the `Resume` model, which is linked directly to the `User`. The user dashboard reloads automatically to showcase these metrics.

#### Phase 2: Start Interview & Context Selection
6. **Lobby Customization:** The user selects their target role, interview duration, difficulty (Easy, Medium, Hard), and toggles the Video Recording checkbox. They then click **Start Interview**.
7. **Initiating Session:** The frontend issues a `POST /api/interview/start` call to the server. `interviewController.ts` creates a stateful `Interview` document in MongoDB with a `pending` status.
8. **AI-Powered Question 1 Generation:** In the backend, `aiService.ts` checks if the user has a saved resume. If yes, it fetches the candidate's skills and projects from the `Resume` model. It calls the **Gemini API** with a rich prompt containing the resume profile, difficulty level, and target role to generate a highly personalized **Question 1** (e.g., if they list React on their resume, it generates a React-specific question). If Gemini is offline, it cleanly falls back to selecting an unseen question from a robust **31+ Question Bank** across categories: DSA, System Design, DB, HR, and Project.
9. **Delivering Session Lobby:** The question is returned to the client browser, redirecting the user to `Interview.tsx`.

#### Phase 3: Active Multi-Modal Q&A Loop
10. **Activating AV Streams & Live AI Tracker (WebRTC + MediaPipe):** 
    * The camera and microphone are activated using **WebRTC** (`navigator.mediaDevices.getUserMedia`).
    * The frontend automatically hooks up a **`MediaRecorder`** instance, capturing a high-fidelity video stream in the background.
    * A custom React hook `useBodyLanguageAnalysis` boots up **MediaPipe** on the canvas, measuring live parameters such as **eye contact frequency**, **face orientation** (detecting off-screen distraction), and **facial pose confidence**.
11. **Narration (TTS):** The browser's **Web Speech Synthesis API** reads the generated question aloud, acting as the voice of the AI interviewer "Alex".
12. **Speech-to-Text Transcription:** The candidate responds. They can type their answer, or toggle **Voice Input** which uses the browser's built-in continuous **Web Speech Recognition API (`webkitSpeechRecognition`)** to transcribe spoken words into the text box in real-time.
13. **Submitting & Evaluation:** The user clicks **Submit Answer** sending the response to `POST /api/interview/submit-answer`.
    * **AI Evaluation Engine:** `aiService.ts` prompts the Gemini API to grade the candidate's depth of knowledge, communication structure, accuracy, and use of practical examples.
    * **Grading Output:** The API returns a secure JSON package containing:
      * **Score:** 1 to 5 scale.
      * **Overall Feedback:** A detailed assessment of their answer.
      * **Strengths:** 2-3 specific elements they explained correctly.
      * **Improvements:** Actionable notes on missing parameters.
      * **Follow-up Question:** A deeper, context-aware follow-up question based *specifically* on what the candidate just answered.
    * **Local Fallback Mode:** If Gemini is unavailable, a local tokenization service analyzes the word overlap with ideal answer templates, adjusting scores for structural details, examples, and minimum length (15+ words).
14. **Looping:** The candidate receives immediate color-coded feedback on screen, then clicks **Next Question** to load the follow-up or the next core question. This loop repeats for up to 10 questions.

#### Phase 4: Ending and Video Archiving
15. **Halt Capture:** The interview ends (10 questions complete, manual termination, or timer expires). 
    * The **WebRTC MediaRecorder** is halted, compiling all background chunks into a single, high-fidelity WebM video blob.
    * The **MediaPipe** vision loop is stopped, consolidating tracking metrics into averaged scores.
16. **Session Finalization:** The frontend triggers `POST /api/interview/end` sending the compiled body language averages. The server calls Gemini to construct an encouraging, personalized closing message summarizing key highlights, sets the status to `completed`, and updates the Mongoose `Interview` model.
17. **Cloud Video Upload:** In the background, the frontend streams the WebM video blob via the `/api/video/upload-chunk` API. `cloudinaryService.ts` uploads the file securely to a **Cloudinary** cloud bucket, returning a secure URL and Public ID that are committed to the interview record in MongoDB.

#### Phase 5: Dashboard Analytics & Performance Review
18. **Interactive Results Page:** The candidate is redirected to `InterviewResult.tsx`. 
19. **Performance Assessment:** The page fetches the interview record. Recharts visualizes historical performance, radar maps for category scores, and body language compliance metrics.
20. **Replay Player:** The candidate can review their complete question-by-question transcript alongside their graded feedback and play back their recorded session directly using the integrated Cloudinary video player.

---

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