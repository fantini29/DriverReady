# DriveReady 🚗

> The fun way to ace your driver's license test.

**Live app:** https://fantini29.github.io/DriverReady/

A gamified US driver's license test prep app for teenagers. Study the rules of the road, take practice quizzes, earn badges, and track your readiness — all in one place.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Opens at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Status

**~45% complete.** Core learning loop is fully functional — a user can onboard, study lessons, take quizzes, earn XP and badges, and track their readiness score.

See [PLAN.md](./PLAN.md) for the full build plan and detailed progress tracker.

See [CLAUDE.md](./CLAUDE.md) for Claude Code instructions and architecture notes.

### What works today
- ✅ Onboarding flow (name, avatar, state)
- ✅ Dashboard with License Readiness Meter, XP bar, quiz history
- ✅ 5 topics, 9 lessons with mini-check quizzes
- ✅ 3 quiz modes: Practice, Challenge, Mock Test
- ✅ XP, levels, badges, streaks
- ✅ Profile with badge collection and progress stats
- ✅ Progress saved to localStorage

### What's next
- 🔨 More lessons (Vehicle Basics, Special Situations)
- 🔨 Expanded question bank (25 → 500+ questions)
- 🔨 Daily challenges & streak freeze
- 🔨 State-specific pass thresholds
- 🔨 Supabase backend for real accounts
- 🔨 Friends leaderboard

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Custom CSS-in-JS (template literal) |
| Fonts | Fredoka One + Nunito (Google Fonts) |
| Storage | localStorage + Supabase |
| Hosting | GitHub Pages |

---

## Project Structure

```
driveready/
├── index.html          ← HTML entry point
├── vite.config.js      ← Vite config
├── package.json
├── CLAUDE.md           ← Claude Code instructions
├── PLAN.md             ← Build plan & progress tracker
├── README.md           ← This file
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx        ← React root
    └── App.jsx         ← Entire app (~1,300 lines)
```

---

## Design

- **Theme:** Dark navy with amber/orange accents
- **Fonts:** Fredoka One (headings) + Nunito (body)
- **Layout:** Mobile-first, max-width 480px
- **Colors:** `#0f172a` bg · `#f59e0b` accent · `#10b981` success · `#ef4444` danger

---

## Contributing / Continuing Development

This project was started with Claude (claude.ai) and is designed to be continued with Claude Code. Load `CLAUDE.md` into your Claude Code session for full context on the architecture, data structures, and what to build next.
