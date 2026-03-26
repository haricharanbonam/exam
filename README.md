# ExamY — Online Proctored Exam Platform

ExamY is a full-stack online examination platform with built-in proctoring powered by AI-based object detection. Instructors can create timed quizzes, share them via exam codes, and monitor students in real time using webcam snapshots and YOLO-based object detection. Students can attempt exams in a controlled, full-screen environment and view their results afterward.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Frontend Pages & Components](#frontend-pages--components)
- [Backend API Reference](#backend-api-reference)
- [Database Schema](#database-schema)
- [Integrations](#integrations)
- [Authentication & Authorization](#authentication--authorization)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [What's Implemented vs. What's Pending](#whats-implemented-vs-whats-pending)
- [Known Issues & Technical Debt](#known-issues--technical-debt)

---

## Features

### ✅ Implemented

| Feature | Description |
|---|---|
| User Registration & Login | JWT-based authentication (student / instructor roles) |
| Token Refresh | Automatic access-token refresh using stored refresh token |
| Quiz Creation | Instructors create timed, multiple-choice quizzes with a unique exam code |
| Exam Code Entry | Students enter an exam code on the home page to access an exam |
| Exam Instructions Page | Shows exam details (duration, number of questions) before starting |
| Permission Verification | Verifies camera access and full-screen mode before the exam begins |
| Proctored Exam Interface | Timed question navigation with webcam snapshot capture |
| Object Detection (Proctoring) | YOLO-based detection of people/objects in webcam snapshots |
| Suspicious Activity Alerts | Pop-up warnings and remark logging when cheating is detected |
| Answer Saving | Each answer is saved individually as the student progresses |
| Exam Submission | Final submission with auto-calculated score |
| Resume Exam | Students can resume an in-progress exam after a disconnection |
| Test Results History | Students can view all their previously attempted tests and scores |
| User Profile Page | Displays user info and attempted test history |

### 🚧 Pending / Incomplete

| Feature | Status |
|---|---|
| Email Verification | Configured (Nodemailer ready) but not triggered |
| Avatar Upload | UI placeholder exists; Cloudinary upload not wired |
| User Profile Editing | `updateDetails` / `updateUserAvatar` endpoints commented out |
| Exam Code Sharing Modal | `CopyCode.jsx` component built but not integrated in CreateQuiz |
| Invalid Activity Popup | `InvalidPopup.jsx` built but not used |
| Detailed Cheat Analysis | Only raw counts stored; no analytics dashboard |
| Proctoring Image Storage | Cloudinary upload configured but not invoked from detection service |
| Instructor Dashboard | No page to view created tests or student results |
| Admin Panel | No administrative interface |
| Email Notifications | `SendEmail.js` utility exists but never called |
| Time Picker Component | `TimePicker.jsx` built but not integrated |

---

## Tech Stack

### Frontend (`client/`)
| Tool | Version | Purpose |
|---|---|---|
| React | 19.1.0 | UI framework |
| Vite | 7.0.0 | Build tool & dev server |
| React Router DOM | 7.6.3 | Client-side routing |
| Tailwind CSS | 4.1.11 | Utility-first styling |
| Axios | 1.10.0 | HTTP client with interceptors |
| React-Webcam | 7.2.0 | Webcam snapshot capture |
| ESLint | 9.29.0 | Linting |

### Backend (`server/`)
| Tool | Version | Purpose |
|---|---|---|
| Node.js | (LTS) | Runtime (ES Modules) |
| Express | 5.1.0 | HTTP framework |
| Mongoose | 8.15.1 | MongoDB ODM |
| jsonwebtoken | 9.0.2 | JWT access & refresh tokens |
| bcrypt | 6.0.0 | Password hashing |
| Multer | 2.0.1 | Multipart file uploads |
| Cloudinary | 2.6.1 | Cloud image storage |
| Nodemailer | 7.0.3 | Email delivery |
| cors | 2.8.5 | Cross-origin resource sharing |
| dotenv | 16.5.0 | Environment variable loading |
| Nodemon | 3.1.10 | Dev auto-restart |

### Object Detection (`object-detection/`)
| Tool | Purpose |
|---|---|
| Flask + flask-cors | Python REST API |
| OpenCV (cv2) | Image processing |
| Ultralytics / YOLO v4 | Object & person detection |
| PyMongo | MongoDB driver (Python) |

---

## Project Structure

```
exam/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── pages/                 # Page-level components
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── CreateQuiz.jsx
│   │   │   ├── ExamInterface.jsx
│   │   │   ├── StartExamPage.jsx
│   │   │   ├── AttemptTest.jsx
│   │   │   └── Profile.jsx
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Auth.jsx           # Private route wrapper
│   │   │   ├── Navbar.jsx
│   │   │   ├── ExamCode.jsx
│   │   │   ├── SnapshotCamera.jsx # Webcam capture for proctoring
│   │   │   ├── Popup.jsx          # Cheating detection alert
│   │   │   ├── SubmitPopup.jsx
│   │   │   ├── CopyCode.jsx       # Exam code sharing (not yet integrated)
│   │   │   ├── InvalidPopup.jsx   # Invalid activity popup (not yet used)
│   │   │   └── TimePicker.jsx     # Time selector (not yet integrated)
│   │   ├── context/
│   │   │   └── CameraContext.jsx  # React context for webcam stream
│   │   ├── utils/
│   │   │   └── axios.js           # Axios instance with JWT interceptors
│   │   ├── App.jsx                # Route definitions
│   │   └── main.jsx               # App entry point
│   ├── vite.config.js
│   └── package.json
│
├── server/                        # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── user.controller.js # Registration, login, logout, profile
│   │   │   └── test.controller.js # Create, start, resume, submit, results
│   │   ├── routes/
│   │   │   ├── user.routes.js
│   │   │   └── test.routes.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── Test.model.js
│   │   │   └── Response.model.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js  # JWT verification
│   │   │   └── multer.js           # File upload config
│   │   ├── db/
│   │   │   └── index.js            # MongoDB connection
│   │   ├── utils/
│   │   │   ├── AsyncHandler.js
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   ├── cloudinary.js       # Cloudinary upload helper
│   │   │   └── SendEmail.js        # Nodemailer helper (unused)
│   │   ├── app.js                  # Express app & middleware config
│   │   ├── index.js                # Server entry point
│   │   └── constants.js            # DB name, cookie options
│   ├── public/temp/                # Temporary multer upload directory
│   └── package.json
│
└── object-detection/              # Python Flask ML service
    ├── app.py                     # Flask app with CORS
    ├── routes/
    │   └── detect.py              # POST /detect endpoint
    ├── services/
    │   ├── object_detection.py    # YOLO inference logic
    │   └── save_remark.py         # Save remark to MongoDB
    ├── requirements.txt
    └── .gitignore
```

---

## Frontend Pages & Components

### Pages

| Page | Route | Description |
|---|---|---|
| `Login.jsx` | `/login` | Email + password login form |
| `SignUp.jsx` | `/signup` | New user registration |
| `Home.jsx` | `/` | Landing page; exam code entry for students |
| `CreateQuiz.jsx` | `/create` | Instructor quiz creation (questions, timing, duration) |
| `ExamInterface.jsx` | `/exam/:id` | Exam info & instructions before starting |
| `StartExamPage.jsx` | `/start/:id` | Verifies camera & full-screen permissions |
| `AttemptTest.jsx` | `/attempt/:id` | Live exam with timer, question navigation, webcam |
| `Profile.jsx` | `/profile/:username` | User profile and test history |

### Key Components

| Component | Purpose |
|---|---|
| `Auth.jsx` | Wraps protected routes; redirects to `/login` if no token |
| `Navbar.jsx` | Top navigation with profile link and logout |
| `ExamCode.jsx` | Controlled input for entering an exam code |
| `SnapshotCamera.jsx` | Captures webcam frames at intervals and sends to detection service |
| `Popup.jsx` | Displays a warning when cheating/suspicious activity is detected |
| `SubmitPopup.jsx` | Confirmation dialog before final submission |
| `CopyCode.jsx` | Modal to copy/share the exam code (not yet triggered) |
| `InvalidPopup.jsx` | Pop-up for flagged invalid activity (not yet used) |
| `TimePicker.jsx` | Time selection UI (not yet integrated) |

---

## Backend API Reference

Base URL (development): `http://localhost:3000`

### User Routes — `/user`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/user/register` | No | Register a new user |
| `POST` | `/user/login` | No | Login and receive JWT tokens |
| `POST` | `/user/logout` | Yes | Logout and clear cookies |
| `POST` | `/user/refresh-token` | No | Exchange refresh token for new access token |
| `GET` | `/user/profile/:username` | No | Get public profile by username |

#### `POST /user/register`
```json
Body: { "fullName": "string", "email": "string", "username": "string", "password": "string", "role": "student|instructor" }
Response: { "user": { ... }, "accessToken": "...", "refreshToken": "..." }
```

#### `POST /user/login`
```json
Body: { "email": "string", "password": "string" }
Response: { "user": { ... }, "accessToken": "...", "refreshToken": "..." }
```

---

### Test Routes — `/test`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/test/create` | Yes | Create a new exam (instructor) |
| `GET` | `/test/interface/:id` | No | Get exam details by test ID |
| `POST` | `/test/start` | Yes | Start an exam; returns response ID |
| `POST` | `/test/resume` | Yes | Resume an in-progress exam |
| `POST` | `/test/question` | Yes | Save an individual answer |
| `POST` | `/test/submit` | Yes | Submit exam and calculate score |
| `GET` | `/test/results` | Yes | Get all attempted tests for current user |

#### `POST /test/create`
```json
Body: {
  "title": "string",
  "description": "string",
  "startTime": "ISO date",
  "endTime": "ISO date",
  "durationMinutes": 60,
  "questions": [
    { "questionText": "...", "options": ["A", "B", "C", "D"], "correctAnswerIndex": 2 }
  ]
}
```

#### `POST /test/question`
```json
Body: { "responseId": "string", "questionIndex": 0, "selectedOptionIndex": 2 }
```

---

### Object Detection Route — `/detect`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/detect` | Send a base64 image; returns detected objects and cheat flag |

```json
Body: { "image": "<base64 string>", "userId": "string", "testId": "string" }
Response: { "cheating": true|false, "detectedObjects": [...], "cheatCount": 2 }
```

> **Note:** The Flask object-detection service runs separately on its own port. In development, an ngrok tunnel is used to expose it publicly.

---

## Database Schema

### `users` collection

```
{
  fullName:      String  (required)
  email:         String  (required, unique, lowercase)
  password:      String  (required, bcrypt-hashed)
  username:      String  (required)
  role:          "student" | "instructor"  (default: "student")
  refreshToken:  String
  interests:     [String]  (default: [])
  createdTests:  [ObjectId → Test]
  attemptedTests:[ObjectId → Response]
  aboutme:       String  (default: "")
  Profession:    String  (default: "")
  avatarUrl:     String  (default: "")
  timestamps:    true
}
```

### `tests` collection

```
{
  title:             String
  description:       String
  examCode:          String  (unique, auto-generated)
  creator:           ObjectId → User
  startTime:         Date
  endTime:           Date
  durationMinutes:   Number
  numberOfQuestions: Number  (default: 0)
  questions: [{
    questionText:       String
    options:            [String]
    correctAnswerIndex: Number
  }]
  timestamps: true
}
```

### `responses` collection

```
{
  test:        ObjectId → Test
  person:      ObjectId → User
  startedAt:   Date
  completedAt: Date
  answers: [{
    questionIndex:       Number
    selectedOptionIndex: Number
  }]
  score:   Number
  submit:  Boolean  (default: false)
  timestamps: true
}
```

### `remarks` collection *(written by Python service)*

```
{
  user:       String  (userId)
  test:       String  (testId)
  image_url:  String
  cheatCount: Number
  time:       Date
}
```

---

## Integrations

| Service | Purpose | Notes |
|---|---|---|
| **MongoDB Atlas / local** | Primary database | URI via `MONGODB_URI` env var |
| **Cloudinary** | Cloud image storage (avatar, proctoring images) | Credentials via env; not fully wired for proctoring |
| **Nodemailer** | Transactional email (verification, notifications) | SMTP via env; not yet triggered |
| **YOLO v4 (Ultralytics)** | Object/person detection for proctoring | Runs inside Flask service |
| **PyMongo** | MongoDB writes from Python detection service | URI must be configured |
| **ngrok** *(dev only)* | Exposes Flask service for local development | Hardcoded URL — must be updated on each session |

---

## Authentication & Authorization

### Flow

1. **Register / Login** → Server returns `accessToken` (short-lived) + `refreshToken` (long-lived) via response body and `httpOnly` cookies.
2. **Client** stores tokens in `localStorage` and attaches `Authorization: Bearer <token>` to every request via an Axios interceptor.
3. **Protected backend routes** use `auth.middleware.js`, which verifies the JWT and attaches the decoded user to `req.user`.
4. **On 401 (token expired)** — the Axios interceptor calls `POST /user/refresh-token` to obtain a new access token and retries the original request.
5. **Logout** — clears cookies and invalidates the refresh token in the database.

### Roles

| Role | Permissions |
|---|---|
| `student` | Attempt exams, view own results & profile |
| `instructor` | Create exams, share exam codes |

---

## Setup & Installation

### Prerequisites

- **Node.js** ≥ 18 and **npm**
- **Python** ≥ 3.9 and **pip**
- **MongoDB** (local or Atlas)
- **Cloudinary** account (optional — for avatar/image uploads)

---

### 1. Clone the Repository

```bash
git clone https://github.com/haricharanbonam/exam.git
cd exam
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Start the backend:
```bash
npm run dev
```
The server will run on `http://localhost:3000`.

---

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

---

### 4. Object Detection Service Setup

```bash
cd object-detection
pip install -r requirements.txt
```

Update the MongoDB URI and any other hardcoded values in `routes/detect.py` before running:
```bash
python app.py
```
The Flask service will run on its default port (typically `5000`).

> **Development tip:** Use [ngrok](https://ngrok.com/) to expose the Flask service if the frontend and backend are not on the same machine.

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default: 3000) |
| `MONGODB_URI` | MongoDB connection string |
| `CORS_ORIGIN` | Allowed frontend origin for CORS |
| `ACCESS_TOKEN_SECRET` | Secret for signing access JWTs |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry (e.g., `15m`) |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh JWTs |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry (e.g., `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_HOST` | SMTP host for Nodemailer |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | Email address for sending |
| `EMAIL_PASS` | Email app password |

---

## What's Implemented vs. What's Pending

### ✅ Implemented & Working

- [x] User registration and login with JWT (access + refresh tokens)
- [x] Token refresh flow with Axios interceptors
- [x] Protected routes (frontend & backend)
- [x] Quiz creation with questions, options, timing, and unique exam code
- [x] Exam info page before starting
- [x] Camera and full-screen permission check before exam
- [x] Live exam interface with countdown timer and question navigation
- [x] Per-answer save (no data loss on disconnect)
- [x] Exam resume after disconnection
- [x] Final submission with score calculation
- [x] Test results / history page
- [x] User profile page with attempted tests
- [x] Webcam snapshot capture during exam
- [x] YOLO-based object/person detection (Flask service)
- [x] Suspicious activity popup and remark logging in MongoDB

### 🚧 Pending / In Progress

- [ ] Email verification after registration
- [ ] Avatar image upload (Cloudinary integration)
- [ ] User profile editing (`updateDetails`, `updateUserAvatar`)
- [ ] Exam code sharing modal in CreateQuiz (component built but not triggered)
- [ ] Invalid activity popup integration (`InvalidPopup.jsx`)
- [ ] Proctoring screenshots stored to Cloudinary
- [ ] Detailed cheat analytics dashboard for instructors
- [ ] Instructor dashboard (view created tests, student responses)
- [ ] Admin panel
- [ ] Email notifications (exam reminders, results)
- [ ] Time picker integration in CreateQuiz (`TimePicker.jsx`)
- [ ] Unit and integration tests

---

## Known Issues & Technical Debt

| Issue | Location | Severity |
|---|---|---|
| MongoDB URI hardcoded | `object-detection/routes/detect.py` | 🔴 High |
| ngrok URL hardcoded | `object-detection/routes/detect.py` | 🔴 High |
| CORS hardcoded to `localhost:5173` | `server/src/app.js` | 🟡 Medium |
| `secure: false` on cookies | `server/src/constants.js` | 🟡 Medium |
| JWT tokens stored in `localStorage` (XSS risk) | `client/src/utils/axios.js` | 🟡 Medium |
| Mock `/detect` endpoint returns hardcoded response | `server/src/app.js` | 🟡 Medium |
| `getUserProfile` logic commented out | `server/src/controllers/user.controller.js` | 🟡 Medium |
| Logout uses GET instead of POST | `client/src/components/Navbar.jsx` | 🟡 Medium |
| "BlogX" branding typo | `client/src/pages/SignUp.jsx` | 🟢 Low |
| `TimePicker.jsx` built but not imported anywhere | `client/src/components/` | 🟢 Low |
| `SendEmail.js` utility never imported | `server/src/utils/` | 🟢 Low |
| No test coverage | Entire codebase | 🟡 Medium |
