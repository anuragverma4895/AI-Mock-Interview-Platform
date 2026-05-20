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
    classDef client fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#f8fafc
    classDef server fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc
    classDef db fill:#78350f,stroke:#f59e0b,stroke-width:2px,color:#f8fafc
    classDef ext fill:#4c1d95,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc
    classDef process fill:#0f172a,stroke:#475569,stroke-width:1px,color:#94a3b8

    %% Core Components
    subgraph UI ["1. USER INTERACTION & FRONTEND (React)"]
        direction TB
        A1["Dashboard & Profile Management"]:::client
        A2["Resume Upload Dropzone"]:::client
        A3["Lobby & Interview Setup Room"]:::client
        A4["Active Interview Board ('Alex')"]:::client
        A5["Results Analytics Suite"]:::client
    end

    subgraph API_GATE ["2. EXPRESS CONTROLLERS (Node.js API)"]
        direction TB
        B1["authController.ts (JWT & Hashing)"]:::server
        B2["resumeController.ts (Upload Handles)"]:::server
        B3["interviewController.ts (Session Manager)"]:::server
        B4["videoController.ts (Blob Processing)"]:::server
    end

    subgraph CORE_LOGIC ["3. CORE SERVICES (Backend Logic)"]
        direction TB
        C1["resumeParser.ts (pdf-parse / mammoth)"]:::server
        C2["aiService.ts (Question Gen & Evaluator)"]:::server
        C3["videoService.ts & cloudinaryService.ts"]:::server
    end

    subgraph DATA_CLOUD ["4. PERSISTENCE & CLOUD SERVICES"]
        direction TB
        D1[("MongoDB Database (Mongoose)")]:::db
        D2["Gemini Flash API (gemini-flash-latest)"]:::ext
        D3["Cloudinary Asset Storage API"]:::ext
    end

    %% Step-by-Step Multi-Phase Linear Connections
    A2 -->|1. Upload File| B2
    B2 -->|2. Extract Text| C1
    C1 -->|3. Run Suitability Prompt| D2
    D2 -->|4. Save Score & Resume| D1
    D1 -->|5. Reload Stats| A1

    A3 -->|6. Start Interview Session| B3
    B3 -->|7. Load Skills Profile| D1
    B3 -->|8. Generate Personalized Q1| C2
    C2 -->|9. Prompt for Resume Q| D2
    C2 -.->|Fallback if Offline| C2
    B3 -->|10. Return Q1 & Audio Setup| A4

    A4 -->|11. Narrate via Browser TTS| A4
    A4 -->|12. Record Webcam WebRTC Stream| A4
    A4 -->|13. Track Eyes/Head with MediaPipe| A4
    A4 -->|14. Transcribe Voice using Speech STT| A4
    A4 -->|15. Submit Answer| B3
    B3 -->|16. Grade accuracy (Score 1-5)| C2
    C2 -->|17. Evaluate Answer Depth| D2
    C2 -->|18. Return Scores & Follow-up Q| A4
    A4 -->|19. Loop Questions 2 to 10| A4

    A4 -->|20. Complete Session & WebM Blob compiled| A4
    A4 -->|21. Send MediaPipe averages & Finalize| B3
    B3 -->|22. Create encouraging ending summary| D2
    B3 -->|23. Save Transcript & status = completed| D1
    A4 -->|24. Stream WebM Chunks| B4
    B4 -->|25. Host securely| C3
    C3 -->|26. Archive Stream| D3
    D3 -->|27. Save URL references| D1

    A5 -->|28. GET Session Analytics| B3
    B3 -->|29. Retrieve session details| D1
    A5 -->|30. Render Radar Charts & Video| A5
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