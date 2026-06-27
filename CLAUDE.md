# DriveReady — Claude Code Project Instructions

## Project Overview
DriveReady is a gamified US driver's license test prep web app targeting teenagers (15–17).
Built as a Vite + React single-page app. Think Duolingo for the DMV.

**Current build: ~45% complete**

## Tech Stack
- React 18 + Vite 5
- Single component file architecture (src/App.jsx)
- Custom CSS-in-JS (css template literal in App.jsx)
- Fonts: Fredoka One (display) + Nunito (body) via Google Fonts
- Storage: localStorage (→ Supabase planned)

## Running the Project
```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build
npm run preview    # preview production build
```

## Project Structure
```
driveready/
├── index.html
├── vite.config.js
├── package.json
├── CLAUDE.md              ← you are here
├── PLAN.md                ← full build plan & progress tracker
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx           ← React entry point
    └── App.jsx            ← entire app (single file, ~1300 lines)
```

## App Architecture (src/App.jsx)
The app is intentionally one file for now. Sections are clearly marked with comments:

```
// ── DATA          constants: STATES, AVATARS, LEVELS, BADGES, TOPICS, QUESTIONS
// ── HELPERS       getLevel(), calcReadiness(), xpToNextLevel()
// ── STYLES        css template literal injected via <style>
// ── COMPONENTS    ReadinessMeter, XPBar, StatCard, QuizHistoryCard
// ── SCREENS       OnboardingScreen, DashboardScreen, LearnScreen,
//                  LessonScreen, QuizScreen, ProfileScreen
// ── MAIN APP      App() — routing, localStorage, streak logic
```

## Design System
| Token | Value |
|---|---|
| Background | `#0f172a` |
| Surface | `#1e293b` |
| Border | `#334155` |
| Accent primary | `#f59e0b` amber |
| Accent secondary | `#f97316` orange |
| Success | `#10b981` |
| Danger | `#ef4444` |
| Muted text | `#94a3b8` |
| Display font | Fredoka One |
| Body font | Nunito |
| Card radius | 16px |
| Small radius | 10px |

## Key Data Structures

### Profile (stored in localStorage as "driveready_profile")
```js
{
  name: string,
  avatar: string,           // emoji: 🚗 🏎️ 🚙 🛻 🚐 🚕
  state: string,            // US state name
  xp: number,
  streak: number,
  lastStudy: string,        // date string
  badges: string[],         // badge IDs
  lessons: {},              // { lessonId: true }
  quizScores: number[],     // score percentages
  quizHistory: QuizEntry[], // last 20 entries
  totalQuestions: number,
  correctAnswers: number,
}
```

### QuizEntry
```js
{
  id: number,       // Date.now()
  mode: string,     // "practice" | "challenge" | "mock"
  topic: string,    // topic id or "all"
  score: number,    // 0–100
  correct: number,
  total: number,
  xpEarned: number,
  passed: boolean,
  date: string,     // ISO
}
```

### Question
```js
{
  id: number,
  topic: string,    // "signs"|"rightofway"|"speed"|"parking"|"safety"
  difficulty: 1|2|3,
  question: string,
  options: string[], // length 4
  answer: number,    // index 0–3
}
```

### Lesson Content Item types
`heading` | `text` | `fact` (label + text) | `tip`

## What's Complete
- ✅ Onboarding (100%) — name, avatar, state, 3-step flow
- ✅ Dashboard (100%) — readiness meter, XP bar, stats, topic progress, quiz history, recommendations
- ✅ Learn Module (50%) — 5 topics, 9 lessons, mini-check quizzes
- ✅ Quiz Engine (75%) — Practice / Challenge / Mock Test, answer review
- ✅ Gamification (70%) — XP, 5 levels, 8 badges, streaks
- ✅ Profile Screen (60%) — edit name/state, avatar picker, badge grid, reset

## What Needs Building (priority order)
See PLAN.md for full details. Short version:

1. **Learn Module completion** — add Vehicle Basics + Special Situations topics
2. **Question bank expansion** — 25 questions → 500+
3. **Daily challenges** — one per day, bonus XP, drives return visits
4. **Streak freeze item** — earnable consumable
5. **Badge animations** — celebration on unlock
6. **State-specific thresholds** — pass score varies per state
7. **Supabase backend** — real auth, cross-device sync
8. **Leaderboard** — requires backend

## Adding New Questions
Add to the `QUESTIONS` array in App.jsx:
```js
{
  id: <next number>,
  topic: "signs", // or rightofway|speed|parking|safety|vehicles|special
  difficulty: 1,  // 1=easy, 2=medium, 3=hard
  question: "Your question here?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: 0, // index of correct option
}
```

## Adding New Lessons
Add to the relevant topic's `lessons` array in TOPICS:
```js
{
  id: "unique_lesson_id",
  title: "Lesson Title",
  content: [
    { type: "heading", text: "Section Heading" },
    { type: "text", text: "Paragraph text..." },
    { type: "fact", label: "Key Term", text: "Explanation..." },
    { type: "tip", text: "Pro tip text..." },
  ]
}
```

## Adding New Topics
Add to the `TOPICS` array:
```js
{
  id: "vehicles",
  title: "Vehicle Basics",
  icon: "🚘",
  color: "#6366f1",
  lessons: [ /* lesson objects */ ]
}
```
Also add the topic id to the quiz topic filter select in QuizScreen.

## Splitting Into Multiple Files (when ready)
Suggested refactor structure:
```
src/
├── main.jsx
├── App.jsx              ← routing shell only
├── data/
│   ├── topics.js
│   ├── questions.js
│   ├── badges.js
│   └── levels.js
├── hooks/
│   └── useProfile.js    ← localStorage logic
├── components/
│   ├── ReadinessMeter.jsx
│   ├── XPBar.jsx
│   └── StatCard.jsx
└── screens/
    ├── Onboarding.jsx
    ├── Dashboard.jsx
    ├── Learn.jsx
    ├── Lesson.jsx
    ├── Quiz.jsx
    └── Profile.jsx
```

## Supabase Migration (when ready)
1. `npm install @supabase/supabase-js`
2. Create `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Replace localStorage reads/writes in `useProfile` hook with Supabase calls
4. Add auth screen before onboarding
5. Tables needed: `profiles`, `quiz_history`, `friendships`
