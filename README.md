# AI Mock Interview Platform

An AI-powered mock interview platform for resume-aware interview practice, AI question generation, answer evaluation, voice interaction, webcam recording, client-side body-language analysis, coding practice, analytics, and interview replay.

> This README is aligned with the current source-code implementation. APIs that exist in the repository but are not used by the active interview UI are explicitly identified.

## Features

- JWT authentication and bcrypt password hashing
- PDF/DOCX resume upload and parsing
- Resume suitability analysis
- Resume-aware AI interview questions
- Technical and HR interview modes
- Difficulty and duration selection
- AI answer evaluation with score, feedback, strengths, improvements, ideal answer, and follow-up question
- Browser text-to-speech and speech-to-text
- Browser camera and microphone capture
- Full interview recording with MediaRecorder
- Cloudinary storage for completed recordings
- Client-side MediaPipe body-language analysis
- Interview transcript and results
- Recharts analytics
- Monaco Editor coding practice
- Static and AI-generated coding challenges
- Public demo recordings

---

# Actual System Architecture

~~~text
React Frontend
   |
   +-- Authentication -----------------> Express -----------------> MongoDB
   |
   +-- Resume Upload ------------------> Resume Parser -----------> MongoDB
   |
   +-- Interview Setup ---------------> /api/interview/start
   |                                          |
   |                                          v
   |                                      AI Service
   |                                          |
   |                              +-----------+-----------+
   |                              |           |           |
   |                           Gemini      OpenAI       Local
   |                         if configured  fallback    fallback
   |
   +-- Interview Room
   |      |
   |      +-- getUserMedia() -> Camera + Microphone
   |      +-- MediaRecorder  -> WebM recording
   |      +-- Web Speech API -> STT + TTS
   |      +-- MediaPipe      -> Body-language metrics
   |      |
   |      +-- /api/interview/submit-answer/:id
   |                   |
   |                   +-- AI evaluation
   |                   +-- MongoDB
   |
   +-- End Interview
   |      |
   |      +-- /api/interview/end/:id
   |      |       |
   |      |       +-- save body-language metrics
   |      |       +-- calculate final score
   |      |       +-- closing message
   |      |
   |      +-- demoAPI.uploadRecording()
   |              |
   |              +-- /api/demo/upload-recording/:id
   |                      |
   |                      +-- Cloudinary
   |                      +-- recording URL saved in MongoDB
   |
   +-- Results / Analytics
          |
          +-- MongoDB interview data
          +-- Cloudinary recording playback
~~~

---

# Important Implementation Details

## 1. Active interview recording flow

The active interview page uses MediaRecorder in the browser.

Actual flow:

~~~text
getUserMedia()
    |
    v
MediaRecorder
    |
    v
WebM chunks in browser memory
    |
    v
stopFullRecording()
    |
    v
final WebM Blob
    |
    v
demoAPI.uploadRecording()
    |
    v
POST /api/demo/upload-recording/:interviewId
    |
    v
Cloudinary
    |
    v
recordingUrl + recordingPublicId + duration
    |
    v
MongoDB Interview
~~~

The main interview UI does NOT use the chunked video upload APIs for its normal recording path.

## 2. Body-language analysis flow

Body-language analysis is performed in the browser.

Actual flow:

~~~text
Interview video element
    |
    v
useBodyLanguageAnalysis.ts
    |
    v
MediaPipe Face Landmarker
    |
    v
sample approximately every 2 seconds
    |
    v
aggregate eye contact / face orientation /
head stability / face visibility
    |
    v
confidence score + suggestions
    |
    v
POST /api/interview/end/:interviewId
    |
    v
Interview.bodyLanguageData
~~~

The endpoint POST /api/video/analyze-body-language currently returns HTTP 501. It does not perform the project's active body-language analysis.

## 3. AI provider flow

Interview question generation and answer evaluation use this order:

~~~text
Gemini
   |
   | unavailable / failure
   v
OpenAI
   |
   | unavailable / failure
   v
Local fallback
~~~

Gemini is used only when GEMINI_API_KEY is configured.

Resume suitability analysis uses:

~~~text
Gemini
   |
   | unavailable / not configured
   v
Local keyword analysis
~~~

---

# End-to-End Interview Flow

## 1. Authentication

Users can register and log in.

The backend:

1. Validates input.
2. Hashes passwords with bcryptjs.
3. Creates/authenticates the user.
4. Returns a JWT.
5. Protects authenticated resources with JWT middleware.

Frontend authentication state is maintained with Zustand.

Endpoints:

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- PATCH /api/auth/profile
- PATCH /api/auth/settings

---

## 2. Resume Upload and Parsing

Frontend page:

ResumeUpload.tsx

Endpoint:

POST /api/resume/upload

The backend uses:

- Multer for upload handling
- pdf-parse for PDF extraction
- mammoth for DOCX extraction

Extracted data:

- Skills
- Projects
- Experience

The parsed data is stored in the MongoDB Resume collection.

### Resume suitability analysis

Endpoint:

POST /api/resume/analyze/:id

The user supplies a target role.

If GEMINI_API_KEY is available, the backend performs Gemini-based analysis.

Otherwise, the backend performs local keyword matching.

The response contains:

- Suitability score
- Matched skills
- Missing skills
- Recommendations

The current Resume MongoDB schema stores parsed resume data; suitability-analysis output is returned by the endpoint and is not stored as a separate analysis field.

---

# 3. Interview Setup

Frontend page:

InterviewSetup.tsx

The user selects:

- Job role
- Interview type
- Difficulty
- Duration
- Optional resume

Endpoint:

POST /api/interview/start

The backend:

1. Reads interview configuration.
2. Loads the selected resume if provided.
3. Verifies resume ownership.
4. Selects the initial question category.
5. Sends candidate context to the AI service.
6. Creates an Interview document.
7. Stores the first question and transcript entry.
8. Returns the interview ID and first question.

The main interview flow supports up to 10 questions.

---

# 4. AI Question Generation

Main service:

backend/src/services/aiService.ts

Question prompts can contain:

- Job role
- Interview type
- Difficulty
- Resume skills
- Resume projects
- Resume experience
- Previous questions

The system attempts to generate short, clear, personalized, non-repetitive questions.

Categories used by the interview controller include:

- DSA
- SystemDesign
- DB
- HR
- Project

If AI services are unavailable, a local predefined question bank is used.

---

# 5. Interview Room

Main page:

frontend/src/pages/Interview.tsx

The browser requests camera and microphone access with getUserMedia.

The local stream is shown in the interview UI.

The browser MediaRecorder records the stream.

This is local browser capture and recording; the active interview flow is not a server-side peer-to-peer WebRTC call.

---

# 6. Text-to-Speech

The browser Web Speech API is used for question narration.

The frontend uses speechSynthesis to read AI-generated questions.

The user can also manually trigger question narration.

---

# 7. Speech-to-Text

The candidate can type an answer or use browser speech recognition.

The frontend checks for:

- SpeechRecognition
- webkitSpeechRecognition

The recognition uses continuous/interim results and places the recognized text into the answer field.

The final text is submitted to the backend like a normal answer.

---

# 8. Body-Language Analysis

Implementation:

frontend/src/hooks/useBodyLanguageAnalysis.ts

Technology:

@mediapipe/tasks-vision

The hook initializes MediaPipe Face Landmarker and analyzes the interview video element approximately every two seconds.

The current implementation calculates:

- Eye contact percentage
- Face orientation / centering percentage
- Head stability percentage
- Face visibility percentage
- Derived confidence score
- Suggestions for improvement

At interview end, stopBodyAnalysis() returns the aggregated metrics.

Those metrics are sent through:

POST /api/interview/end/:interviewId

and stored in:

Interview.bodyLanguageData

---

# 9. Answer Evaluation

Endpoint:

POST /api/interview/submit-answer/:interviewId

The backend sends the answer to the AI service.

Evaluation considers:

- Technical accuracy
- Depth of knowledge
- Practical examples
- Communication clarity
- Relevance
- Difficulty level

The response contains:

- Score from 1 to 5
- Feedback
- Strengths
- Improvements
- Ideal answer
- Follow-up question

The answer, score, and feedback are stored in the Interview question.

If AI is unavailable, local evaluation uses keyword overlap, ideal-answer coverage, category keywords, answer length, structure, and example/reasoning signals.

---

# 10. Next Question

Endpoint:

GET /api/interview/next-question/:interviewId

The backend:

1. Loads the interview.
2. Verifies ownership/status.
3. Reads conversation history.
4. Selects the next category/difficulty.
5. Loads resume context where available.
6. Generates the next question.
7. Saves the question and transcript entry.
8. Returns the question.

The main interview ends after 10 questions.

---

# 11. Ending the Interview

The interview can end because:

- 10 questions are complete
- The user manually finishes
- The timer reaches zero

The frontend:

1. Stops MediaRecorder.
2. Creates the final WebM Blob.
3. Stops MediaPipe analysis.
4. Stops camera/microphone tracks.
5. Cancels speech synthesis.
6. Sends body-language metrics to the backend.

Endpoint:

POST /api/interview/end/:interviewId

The backend:

1. Marks the interview completed.
2. Saves completion time.
3. Saves body-language data.
4. Calculates the final score as the average of scored questions.
5. Identifies strong areas.
6. Identifies improvement areas.
7. Generates a closing message.
8. Saves the Interview document.

---

# 12. Cloudinary Recording Upload

After the interview-end request succeeds, the frontend uploads the final WebM recording.

Active function:

demoAPI.uploadRecording()

Active endpoint:

POST /api/demo/upload-recording/:interviewId

The backend:

1. Verifies the interview.
2. Verifies ownership.
3. Reads the recording buffer.
4. Uploads it to Cloudinary.
5. Saves the secure URL.
6. Saves the Cloudinary public ID.
7. Saves recording duration.

MongoDB fields:

- recordingUrl
- recordingPublicId
- recordingDuration

---

# 13. Video APIs That Are Present but Not the Active Flow

The repository also contains:

- POST /api/video/upload-chunk
- POST /api/video/finalize
- GET /api/video/:id
- GET /api/video/:id/download

These are implemented through videoService.ts for local chunk storage/combination.

However, the current Interview.tsx recording flow does not use these endpoints.

There is also:

- POST /api/video/analyze-body-language

but its current controller returns HTTP 501.

Therefore, documentation should not claim that server-side body-language analysis or chunked video uploading is the active main interview flow.

---

# 14. Interview Results and Analytics

Results page:

/interview-result/:id

The application can display:

- Final score
- Question-wise scores
- Feedback
- Strengths
- Improvements
- Transcript
- Body-language metrics
- Recording/replay

Analytics:

GET /api/analytics/:userId

Returns:

- Total completed interviews
- Average score
- Score trends
- Weak areas
- Strong areas
- Recent interviews
- Recording availability

Interview analytics:

GET /api/analytics/interview/:id

Returns:

- Final score
- Question count
- Category scores
- Body-language data
- Duration

---

# Coding Practice

Coding practice is a separate platform feature.

Frontend:

- CodingChallenges.tsx
- LiveCodingEditor.tsx

Editor:

@monaco-editor/react

The UI exposes:

- JavaScript
- Python
- Java
- C++
- C

Backend coding functionality includes:

- Static challenges
- Random challenges
- AI-generated challenges
- Test-case evaluation
- Passed/failed results
- Final score
- Coding session history

Endpoints:

- GET /api/coding/challenges
- POST /api/coding/start
- POST /api/coding/submit/:interviewId
- POST /api/coding/generate
- GET /api/coding/sessions
- GET /api/coding/sessions/:interviewId

Coding information can be stored in the Interview model through:

- codingChallenge
- codingResults
- codingPassedCount
- codingTotalCount

---

# Public Demo Recordings

Completed recordings can be published.

Endpoints:

- POST /api/demo/publish/:interviewId
- POST /api/demo/unpublish/:interviewId
- DELETE /api/demo/recording/:interviewId
- GET /api/demo/my-recordings
- GET /api/demo/public

The public endpoint returns published completed recordings without authentication.

---

# Tech Stack

## Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI |
| TypeScript | Type safety |
| Vite | Build tooling |
| Tailwind CSS | Styling |
| Zustand | Auth/global state |
| React Router DOM | Routing |
| Axios | REST API client |
| Framer Motion | Animations |
| Radix UI | UI primitives |
| Recharts | Analytics |
| Monaco Editor | Coding editor |
| MediaPipe Tasks Vision | Client-side face analysis |
| MediaRecorder API | Interview recording |
| getUserMedia | Camera/microphone capture |
| Web Speech API | Speech-to-text and text-to-speech |

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | REST API |
| TypeScript | Type safety |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Multer | File uploads |
| pdf-parse | PDF parsing |
| mammoth | DOCX parsing |
| Gemini API | Primary AI provider when configured |
| OpenAI API | AI fallback |
| Cloudinary | Video storage |
| express-validator | Request validation |
| file-type | File-content validation |
| Helmet | Security headers |
| CORS | Cross-origin configuration |
| async-retry | AI retry handling |

---

# Database Models

## User

Stores:

- Name
- Email
- Password hash
- Role
- Timestamps

## Resume

Stores:

- User ID
- Original filename
- Local file path
- Parsed skills
- Parsed projects
- Parsed experience
- Timestamps

## Interview

Stores:

- User ID
- Optional Resume ID
- Interview type
- Status
- Questions
- Answers
- Scores
- Feedback
- Ideal answers
- Transcript
- Current question index
- Duration
- Start/completion timestamps
- Final score
- Body-language data
- Recording URL
- Cloudinary public ID
- Recording duration
- Published state
- Coding challenge/results

---

# API Reference

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| PATCH | /api/auth/profile | Update profile |
| PATCH | /api/auth/settings | Update settings |

## Resume

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/resume/upload | Upload and parse |
| POST | /api/resume/analyze/:id | Analyze resume |
| GET | /api/resume/:id | Get resume |
| GET | /api/resume/user/:userId | Get user resumes |
| DELETE | /api/resume/:id | Delete resume |

## Interview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/interview/start | Start interview |
| GET | /api/interview/next-question/:interviewId | Next question |
| POST | /api/interview/submit-answer/:interviewId | Evaluate answer |
| POST | /api/interview/follow-up/:interviewId | Follow-up |
| POST | /api/interview/end/:interviewId | End interview |
| GET | /api/interview/:id | Get interview |
| GET | /api/interview/user/:userId | User interviews |
| GET | /api/interview/transcript/:id | Transcript |

## Active Recording / Demo

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/demo/upload-recording/:interviewId | Upload final WebM to Cloudinary |
| POST | /api/demo/publish/:interviewId | Publish recording |
| POST | /api/demo/unpublish/:interviewId | Unpublish recording |
| DELETE | /api/demo/recording/:interviewId | Delete recording |
| GET | /api/demo/my-recordings | User recordings |
| GET | /api/demo/public | Public recordings |

## Alternate Video APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/video/upload-chunk | Save local chunk |
| POST | /api/video/finalize | Combine local chunks |
| GET | /api/video/:id | Local video metadata |
| GET | /api/video/:id/download | Download local video |
| POST | /api/video/analyze-body-language | Currently returns 501 |

## Analytics

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/analytics/:userId | User analytics |
| GET | /api/analytics/interview/:id | Interview analytics |

## Coding

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/coding/challenges | List challenges |
| POST | /api/coding/start | Start coding |
| POST | /api/coding/submit/:interviewId | Evaluate code |
| POST | /api/coding/generate | Generate AI challenge |
| GET | /api/coding/sessions | User sessions |
| GET | /api/coding/sessions/:interviewId | Coding session |

---

# Project Structure

~~~text
AI-Mock-Interview-Platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── interviewController.ts
│   │   │   ├── resumeController.ts
│   │   │   └── videoController.ts
│   │   ├── middleware/
│   │   ├── models/
│   │   │   ├── Interview.ts
│   │   │   ├── Resume.ts
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   ├── analytics.ts
│   │   │   ├── auth.ts
│   │   │   ├── coding.ts
│   │   │   ├── demo.ts
│   │   │   ├── interview.ts
│   │   │   ├── resume.ts
│   │   │   └── video.ts
│   │   ├── services/
│   │   │   ├── aiService.ts
│   │   │   ├── cloudinaryService.ts
│   │   │   ├── codingService.ts
│   │   │   ├── resumeParser.ts
│   │   │   └── videoService.ts
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useBodyLanguageAnalysis.ts
│   │   ├── lib/
│   │   ├── pages/
│   │   │   ├── Analytics.tsx
│   │   │   ├── CodingChallenges.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DemoPage.tsx
│   │   │   ├── Interview.tsx
│   │   │   ├── InterviewResult.tsx
│   │   │   ├── InterviewSetup.tsx
│   │   │   ├── LiveCodingEditor.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ResumeUpload.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── package.json
├── render.yaml
├── SPEC.md
└── README.md
~~~

---

# Local Development

## Prerequisites

- Node.js 18+
- MongoDB local instance or MongoDB Atlas
- Gemini API key and/or OpenAI API key
- Cloudinary account

## Clone

~~~bash
git clone https://github.com/anuragverma4895/AI-Mock-Interview-Platform.git
cd AI-Mock-Interview-Platform
~~~

## Install

~~~bash
npm run install:all
~~~

Or separately:

~~~bash
cd backend
npm install

cd ../frontend
npm install
~~~

## Backend environment

Create backend/.env:

~~~env
PORT=5005
MONGODB_URI=mongodb://localhost:27017/ai-interview
JWT_SECRET=change-this-secret
NODE_ENV=development

GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
~~~

The source configuration defaults the backend port to 5005 when PORT is not supplied.

## Frontend environment

If the frontend runs separately:

~~~env
VITE_BACKEND_URL=http://localhost:5005/api
~~~

## Run

~~~bash
npm run dev
~~~

Or separately:

~~~bash
cd backend
npm run dev
~~~

~~~bash
cd frontend
npm run dev
~~~

---

# Production Build

~~~bash
npm run build
npm start
~~~

The root production command starts:

~~~text
node backend/dist/index.js
~~~

In production, the backend can serve the built frontend SPA from frontend/dist.

---

# Deployment

The repository contains render.yaml for Render deployment.

The deployment configuration contains backend and frontend services.

Backend production configuration requires:

- MongoDB connection
- JWT secret
- AI provider credentials
- Cloudinary credentials

The source code supports GEMINI_API_KEY, but the committed Render configuration currently declares OPENAI_API_KEY and does not declare GEMINI_API_KEY. Gemini should therefore only be described as active when that environment variable is actually configured.

---

# Security

The backend includes:

- JWT authentication
- bcrypt password hashing
- Helmet security headers
- CORS
- Express validation
- Uploaded-file validation
- Ownership checks for authenticated resources
- Centralized error handling

---

# Main Frontend Routes

| Route | Access | Purpose |
|---|---|---|
| / | Public | Landing page |
| /login | Public | Login |
| /register | Public | Registration |
| /demo | Public | Public demo recordings |
| /dashboard | Protected | Dashboard |
| /interview | Protected | Interview setup |
| /interview/:id | Protected | Active interview |
| /interview-result/:id | Protected | Interview result |
| /resume | Protected | Resume management |
| /analytics | Protected | Analytics |
| /coding | Protected | Coding challenges |
| /coding/live | Protected | Live coding |
| /profile | Protected | Profile |
| /settings | Protected | Settings |

---

# Interview Explanation

A concise source-code-accurate explanation is:

~~~text
The platform has a React and TypeScript frontend with a Node.js,
Express and MongoDB backend.

The user can upload a PDF or DOCX resume. The backend parses it
using pdf-parse or mammoth and stores skills, projects and experience
in MongoDB.

During interview setup, the user selects role, interview type,
difficulty and duration. The backend creates an Interview document
and the AI service generates a resume-aware question. Gemini is used
when configured, OpenAI is available as a fallback, and a local
question bank is used when AI services are unavailable.

Inside the interview room, the browser accesses the camera and
microphone using getUserMedia. MediaRecorder records the session as
WebM. The Web Speech API provides speech-to-text and text-to-speech.

MediaPipe Face Landmarker runs directly in the browser for
body-language analysis. It calculates eye contact, face orientation,
head stability and face visibility. At the end of the interview,
these metrics are sent to /api/interview/end/:interviewId and stored
in MongoDB.

For every answer, the frontend sends the text to the backend. The
AI service evaluates the answer and returns a score, feedback,
strengths, improvements, ideal answer and follow-up question.

When the interview ends, the final WebM Blob is uploaded through
demoAPI.uploadRecording() to /api/demo/upload-recording/:id. The
backend uploads it to Cloudinary and stores the resulting URL and
public ID in MongoDB.

The result and analytics pages then use the stored interview data
and Cloudinary URL to display performance and replay the recording.
~~~

---

# Key Source-Code Truths

1. Body-language analysis is client-side MediaPipe.
2. POST /api/video/analyze-body-language is currently a 501 stub.
3. The active recording path is MediaRecorder -> demoAPI.uploadRecording() -> /api/demo/upload-recording/:id -> Cloudinary.
4. The chunked /api/video/upload-chunk and /api/video/finalize APIs exist but are not the active Interview.tsx recording path.
5. Interview AI uses Gemini when configured, then OpenAI, then local fallback.
6. Resume suitability analysis uses Gemini when configured and local keyword analysis as fallback.
7. Resume parsing uses pdf-parse and mammoth.
8. Interview state, questions, answers, scores, transcript, body-language metrics and recording metadata are stored in MongoDB.
9. Active video binary storage uses Cloudinary.
10. Camera/microphone capture, recording, speech recognition, speech synthesis and MediaPipe processing happen in the browser.

---

## License

MIT
