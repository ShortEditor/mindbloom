# MindTrack AI - Product Requirements Document (PDR)

## 1. 🎯 Problem Statement

Students and young professionals face:

- Stress, anxiety, burnout
- No easy way to track mental state daily
- Therapy is expensive / inaccessible
- Existing apps are either too generic or not actionable

**👉 There is no simple, intelligent, daily-use mental wellness tracker + assistant.**

---

## 2. 💡 Solution

Build a lightweight AI-powered mental wellness app that:

- Tracks mood daily
- Gives instant AI support (chat + suggestions)
- Detects patterns (stress, burnout signals)
- Recommends actions (breathing, journaling, tasks)

---

## 3. 👥 Target Users

- Students (16–25)
- Developers / tech users
- Early professionals

---

## 4. 🚀 Core Features (MVP – Hackathon Ready)

### 4.1 Mood Tracker

- User selects mood (😊 😐 😞 😡 😴)
- Optional text input ("How are you feeling?")
- Stored daily

### 4.2 AI Chat Support

Simple chatbot (use OpenAI API or rule-based fallback)

Helps user:

- Vent emotions
- Get suggestions
- Feel heard

### 4.3 Smart Insights (Basic AI Logic)

Detect patterns like:

- 3+ sad days → "You might be stressed"

Show insights:

- "You felt low 4 times this week"

### 4.4 Quick Relief Tools

Buttons for:

- 🫁 Breathing exercise (timer-based)
- 📝 Journaling
- 🎧 Calm suggestions (music/quotes)

### 4.5 Dashboard

- Mood graph (last 7 days)
- Simple stats:
  - Average mood
  - Streak tracking

---

## 5. 🧩 Features (Post-MVP / Future Scope)

- Voice journaling
- Emotion detection via text AI
- Community support
- Therapist connect
- Habit tracking
- AI-generated routines

---

## 6. 🛠️ Tech Stack (Fast Build)

### Frontend

- React / Next.js
- Tailwind CSS

### Backend

- Firebase (best for hackathon)
- Firestore (database)
- Authentication
- Hosting

### AI

- OpenAI API (chat + suggestions)

---

## 7. 🏗️ System Architecture

```
User → Frontend (React)
        ↓
    Firebase Auth
        ↓
    Firestore DB (mood logs)
        ↓
    AI API (chat + insights)
```

---

## 8. 📊 Data Model (Simple)

### User

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | User's name |
| email | string | User's email |

### Mood Entry

| Field | Type | Description |
|-------|------|-------------|
| userId | string | Reference to User |
| mood | number | 1-5 scale |
| note | string | Optional text input |
| timestamp | datetime | Entry creation time |

---

## 9. 🎨 UI Flow

1. Login / Signup
2. Dashboard
3. Select Mood
4. View Insights
5. Chat with AI

---

## 10. ⚡ Unique Selling Point (USP)

- Not just tracking → understands + responds
- Minimal, fast, daily usable
- AI-driven but simple

---

## 11. 📈 Success Metrics

- Daily active users
- Mood entries per user
- Chat interactions
- Retention (7-day usage)

---

## 12. ⏱️ Hackathon Build Plan (1 Hour Strategy)

| Time | Task |
|------|------|
| 0–15 min | Setup React + Firebase, Basic UI |
| 15–30 min | Mood tracker + save to DB |
| 30–45 min | AI chat integration |
| 45–60 min | Dashboard + simple insights |

---

## 13. ☁️ Deployment

**Yes** — you can host on:

- Firebase Hosting (free tier)
- Or Google Cloud (via Firebase)

---

## 14. ⚠️ Risks & Constraints

- **AI cost** → limit API calls
- **Data privacy** → keep it simple
- **Time constraint** → focus MVP only

---

## Appendix: Project Structure

```
Tast/
├── firebase.json
├── index.html
├── README.md
├── css/
│   ├── animations.css
│   ├── components.css
│   └── main.css
└── js/
    ├── app.js
    ├── firebase-config.js
    ├── firebase-service.js
    ├── icons.js
    ├── journal.js
    ├── meditation.js
    ├── mood.js
    ├── onboarding.js
    └── utils.js
```

---

*Document Version: 1.0*  
*Created: April 25, 2026*  
*Project: MindTrack AI*