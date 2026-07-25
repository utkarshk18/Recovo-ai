# RECOVO AI — Voice-First Post-Surgery Recovery Assistant

[![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.22-blue.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-sql.js%20(SQLite)-orange.svg)](https://github.com/sql-js/sql.js)
[![AI Engine](https://img.shields.io/badge/AI-Google%20GenAI%20%2F%20Gemini-purple.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

**RECOVO AI** is a personal, voice-first post-surgery recovery monitoring application designed to empower patients during their post-operative healing journey. By combining natural language processing, intelligent risk stratification, multi-language support, medication scheduling, and automated emergency escalation, RECOVO AI ensures patients remain safe, informed, and connected to their healthcare providers and caregivers.

---

## 🌟 Key Features

* 🎤 **Voice-First Check-in (Web Speech API)**
  Report daily post-operative symptoms naturally by speaking. Supports real-time speech-to-text transcript rendering, animated waveform visualization, and a manual text editing fallback.
  
* 🧠 **Dual-Engine Symptom Analysis**
  Hybrid intelligence scoring engine combining robust rule-based NLP (with negation parsing and pain scale extraction) with optional **Google Gemini AI (`@google/genai`)** integration to classify patient condition into **Low**, **Medium**, or **High** risk levels.

* 🌐 **Multi-Language Support (4 Languages)**
  Full localization for both UI text and voice recognition in **English (`en`)**, **Hindi (`hi`)**, **Tamil (`ta`)**, and **Telugu (`te`)**.

* ❓ **Adaptive Follow-Up Questions**
  When initial analysis confidence is low or additional diagnostic details are required, the system prompts contextual follow-up questions to refine risk assessment.

* 📈 **Recovery Dashboard & Analytics**
  Interactive visual charts tracking pain level trends, historical risk classifications across recovery days, timeline milestones, and downloadable recovery reports.

* 💊 **Medication Tracker & Schedule**
  Manage daily prescriptions with dosage details, time slots, customizable emoji icons, and status tracking (Taken vs. Pending) backed by daily logging history.

* 🚨 **Emergency Help & Caregiver Dispatch**
  One-touch emergency action button to directly dial healthcare providers, send instant caregiver notifications, and view nearby medical facilities.

* 🌙 **Modern Glassmorphic UI with Dark Mode**
  Responsive mobile-app style interface featuring sleek dark/light mode toggle, custom toasts, smooth state transitions, and accessible navigation.

* 💾 **Zero-Native-Dependency SQLite (`sql.js`)**
  Uses pure JavaScript SQLite compiled via WebAssembly (`sql.js`), enabling cross-platform data persistence (`recovo.db`) without requiring native C++ build tools (`node-gyp`).

---

## 🛠 Technology Stack

### Frontend
- **HTML5 & CSS3**: Custom responsive layout system with CSS variables, glassmorphism UI, custom animations, and Google Font (*Outfit*).
- **Vanilla JavaScript (ES6+)**: SPA navigation, Web Speech API integration, state management, and custom HTML5 canvas rendering for trend charts.

### Backend
- **Node.js & Express.js**: Lightweight RESTful Web API server handling business logic, database queries, and AI analysis pipelines.
- **`@google/genai`**: Google GenAI SDK integration for generative symptom analysis with Gemini models.
- **`sql.js`**: Pure JavaScript SQLite database driver for seamless local data storage and JSON export/persistence.
- **`dotenv` & `cors`**: Environment variable management and Cross-Origin Resource Sharing.

---

## 📁 Project Structure

```text
Recovo ai/
│
├── index.html          # Main single-page application (SPA) shell & modal markup
├── app.js              # Complete frontend logic (Routing, Web Speech, Multi-lang, Canvas charts)
├── styles.css          # Core design system, CSS variables, responsive styles & animations
├── README.md           # Project documentation
│
└── backend/            # Express Node.js backend workspace
    ├── server.js       # Express application entry point & REST API endpoints
    ├── ai-engine.js    # Rule-based NLP symptom scorer & Google GenAI integration
    ├── database.js     # sql.js SQLite database initialization, schemas & seed data
    ├── .env            # Environment configuration (API keys, ports)
    ├── package.json    # Backend package dependencies and scripts
    └── recovo.db       # SQLite database file (auto-generated & auto-persisted)
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
- A modern web browser supporting the Web Speech API (Google Chrome, Microsoft Edge, Brave, or Safari)
- *(Optional)* A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create or edit the `.env` file inside the `backend/` directory:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: If no API key is provided, the backend seamlessly operates using the built-in rule-based NLP fallback engine).*

4. **Start the server:**
   ```bash
   # Development / Production start
   npm start
   ```
   The backend server will output:
   ```text
   🚀 RECOVO AI Backend → http://localhost:3001
   📊 API Health      → http://localhost:3001/api/health
   🌐 Frontend        → http://localhost:3001
   ```

---

### 2. Frontend Setup

Since `server.js` serves static frontend assets directly (`express.static`), you can access the application immediately at **`http://localhost:3001`** after starting the backend!

Alternatively, if developing the frontend separately:
* **VS Code Live Server:** Open `index.html` with Live Server extension.
* **HTTP Server:**
  ```bash
  npx serve .
  ```

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status, database state, and timestamp check |
| `GET` | `/api/patient` | Fetch active patient profile details |
| `PUT` | `/api/patient` | Update patient profile info & notification preferences |
| `POST` | `/api/checkin` | Submit symptom transcript for AI/NLP risk analysis |
| `GET` | `/api/checkins` | Retrieve history of past symptom check-ins |
| `GET` | `/api/checkin/latest` | Get the most recent check-in result for the home widget |
| `POST` | `/api/checkin/:id/followup` | Submit answers to follow-up questions & update analysis |
| `GET` | `/api/medications` | Fetch list of active medications with today's completion status |
| `POST` | `/api/medications` | Add a new medication entry |
| `PUT` | `/api/medications/:id/toggle` | Toggle medication status (Taken / Pending) |
| `DELETE` | `/api/medications/:id` | Remove a medication from active tracking |
| `GET` | `/api/recovery` | Fetch recovery day count, pain/risk trend data, & recent alerts |
| `POST` | `/api/emergency/notify` | Log emergency escalation (Call Doctor / Alert Caregiver) |

---

## 🗄️ Database Schema (`recovo.db`)

The SQLite database managed by `database.js` includes the following tables:

* `patients`: Stores patient metadata (Name, Age, Surgery Type, Surgery Date, Caregiver Contact, Language).
* `checkins`: Records daily symptom descriptions, calculated risk levels, confidence scores, pain levels (0–10), and recommendations.
* `followup_answers`: Stores diagnostic follow-up answers linked to check-in sessions.
* `medications`: Master medication list (Name, Dose, Time Slot, Icon, Active status).
* `med_logs`: Daily log entries tracking when medications were marked as taken.
* `emergency_logs`: Audit log for emergency triggers and caregiver notifications.

---

## 💡 Symptom Scoring Engine Mechanics

The hybrid symptom engine (`ai-engine.js`) evaluates user transcripts through multi-pass scoring:

1. **Negation Filtering:** Ignores phrases like *"no fever"* or *"no swelling"* to prevent false-positive risk elevations.
2. **Pain Scale Parser:** Regex pattern matching (`/(\d+)\s*(?:out of|\/)\s*10/i`) detects numeric pain inputs (e.g., 8/10).
3. **Keyword Stratification:**
   - **High Risk:** Severe pain, high fever, pus/discharge, chest pain, shortness of breath, active bleeding, hot/swollen calf.
   - **Medium Risk:** Moderate pain (5-7/10), mild swelling, redness, low fever, nausea, dizziness, fatigue.
   - **Low Risk:** Mild pain (1-3/10), resting well, no fever, healing progress, medication compliance.

---

## 🔒 Usage Notes & Best Practices

- **Browser Permissions:** Voice check-in requires microphone permissions. Grant permission when prompted by your browser.
- **Language Preference:** App and speech language choices persist across sessions using `localStorage`.
- **Offline Fallback:** If the backend server is unreachable, the frontend automatically falls back to an client-side demo mode.

---

## ⚠️ Medical Disclaimer

*RECOVO AI is an educational and supportive post-operative monitoring assistant designed to complement, not replace, professional healthcare services. Always consult your physician, surgeon, or medical specialist for clinical diagnosis, treatment modifications, or medical emergencies.*

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
