# DriveReady — Build Plan & Progress Tracker

> **Overall progress: ~88% complete**
> Last updated: 2026-05-08 — Module 7 State Coverage complete: state filter in quiz engine, all 50 state thresholds, mock test uses state-specific question count + pass threshold, "Did You Know?" card on Dashboard, state questions added for CA/TX/FL/NY/IL

---

## Module Status Summary

| Module | Feature | Status | Completion |
|--------|---------|--------|------------|
| 1 | Onboarding | ✅ Done | 100% |
| 2 | Dashboard | ✅ Done | 100% |
| 3 | Learn Module | ✅ Done | 100% |
| 4a | Supabase Setup (schema + client + all data) | ✅ Done | 100% |
| 4b | Quiz Engine — Supabase live | ✅ Done | 100% |
| 4c | Question Bank Expansion (500+) | ✅ Done (seeded) | 100% |
| 5 | Gamification | ✅ Done | 100% |
| 6 | Profile Screen | ✅ Done | 100% |
| 7 | State Coverage | ✅ Done | 100% |
| 8 | Leaderboard & Social | ❌ Not started | 0% |
| 9 | Full Backend (auth + profile sync) | ❌ Not started | 0% |

> **Why 4a/4b/4c before Module 9?**
> Questions are public data — no auth needed to read them. Setting up just the questions table
> with public SELECT access unblocked expanding to 500+ questions without bloating the JS bundle
> or requiring a full auth/profile backend migration.

---

## Module 1 — Onboarding ✅ 100%

### Done
- [x] Welcome screen with app intro
- [x] Name entry with validation (min 2 chars)
- [x] Avatar car picker (6 emoji options: 🚗 🏎️ 🚙 🛻 🚐 🚕)
- [x] State selector — all 50 US states
- [x] Step indicator dots
- [x] Profile saved to localStorage on completion
- [x] Streak initialized to 1 on first login

---

## Module 2 — Dashboard ✅ 100%

### Done
- [x] License Readiness Meter (SVG ring, 0–100%, red/amber/green)
- [x] Motivational message below meter based on readiness %
- [x] XP progress bar with level name + XP to next level
- [x] 4 stat cards: Lessons Done, Quiz Accuracy, Badges, Best Score
- [x] Topic progress bars with lesson count AND average quiz score per topic
- [x] Smart recommendation card (detects weak quiz topics OR unstarted topics)
- [x] Quiz History Card — last 3 quizzes, expandable to 10
  - [x] Each entry: mode icon, topic, correct/total, XP earned, time ago
  - [x] Mini score ring per entry (color coded)
  - [x] Pass/Fail label
  - [x] Empty state when no quizzes taken

---

## Module 3 — Learn Module ✅ 100%

### Done
- [x] Topic card grid with color-coded left borders
- [x] Per-topic lesson list with completion state
- [x] Lesson content renderer (heading / text / fact / tip types)
- [x] Mini-check quiz fetches questions from Supabase per topic (falls back to local only if Supabase is null)
- [x] Mini-check result UI is dynamic (score/total, not hardcoded to 3)
- [x] Empty-state handled if a topic has no questions yet
- [x] Lesson marked complete after mini-check (+50 XP)
- [x] Lessons loaded from Supabase `lessons` table (JSONB content)

### Topics in Supabase (master.sql — single source of truth)
- [x] 🛑 Signs & Signals — Sign Shapes & Colors, Traffic Lights, Road Markings, Regulatory Signs, Warning Signs, Guide & Info Signs, Work Zone Signs, Signal Variations **(8 lessons)**
- [x] 🚦 Right of Way — Intersections, Pedestrians & Cyclists, Emergency Vehicles, Special Yielding, Turning Right of Way, **Roundabouts** **(6 lessons)**
- [x] ⚡ Speed & Space — Speed Limits, Following Distance, Highway Driving, Stopping Distances, Lane Management, Urban & City Driving, **HOV Lanes & Ramp Meters** **(7 lessons)**
- [x] 🅿️ Parking & Passing — Parking Rules, Parking on Hills, Passing Rules, Parallel Parking, U-Turns & Turnabouts, Angle & Perpendicular Parking, **Hand & Arm Signals** **(7 lessons)**
- [x] 🛡️ Safe Driving — Distracted Driving, Impaired Driving, Night & Weather Driving, Sharing the Road, Fatigue & Drowsy Driving, Aggressive Driving & Road Rage, Graduated Driver Licensing, Seatbelts & Child Safety, **When Stopped by Law Enforcement** **(9 lessons)**
- [x] 🚘 Vehicle Basics — Lights & Signals, Mirrors & Blind Spots, Pre-Drive Safety Check, Dashboard Warning Lights, Handling a Skid, Tires & Traction, Basic Maintenance, Braking Systems **(8 lessons)**
- [x] ⚠️ Special Situations — Railroad Crossings, Vehicle Emergencies, Construction Zones, Adverse Weather, After a Crash, Breakdowns & Roadside Safety, Mountain Driving, Night Driving **(8 lessons)**
- **Total: 53 lessons**

### Images in lessons (public/signs/)
- [x] `image` content type added to lesson renderer in App.jsx
- [x] 85 images extracted from dlbook.pdf → `public/signs/sign-000.png` to `sign-084.png`
- [x] Images embedded in 9 lessons:
  - sign-001 → Sign Shapes & Colors (all 11 sign shapes)
  - sign-004 → Traffic Lights
  - sign-008 → Passing Rules
  - sign-010 → Lane Management (center turn lane)
  - sign-013 → Intersections (right-of-way)
  - sign-015 → Right of Way When Turning
  - sign-072 → Roundabouts (already present)
  - sign-077 → Highway Driving
  - sign-082 → Parallel Parking

---

## Module 4a — Supabase Setup ✅ 100%

### Done
- [x] `@supabase/supabase-js` installed
- [x] `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [x] `.env.example` template committed
- [x] Supabase client at `src/lib/supabase.js` (returns null if env vars missing)
- [x] `supabase/master.sql` — **single source of truth** combining all SQL files
  - TRUNCATE at top — safe to re-run any time to reset and reload all data
  - 7 topics, 53 lessons, ~187 universal questions, 8 badges, 5 levels
  - 60 Nevada-specific questions (states = array['Nevada'])
  - `CREATE POLICY` blocks are conditional (DO $$ IF NOT EXISTS $$) — idempotent
  - Supersedes: schema.sql, seed.sql, seed_lessons_v2/v3/v4.sql, nevada.sql (kept for reference)
- [x] App.jsx refactored: TOPICS, BADGES, LEVELS removed as inline constants
- [x] All data threaded as props from App() → child screens
- [x] Helper functions (getLevel, getNextLevel, xpToNextLevel, calcReadiness) accept data as parameters
- [x] App loads topics+lessons+badges+levels via Promise.all on mount with loading screen
- [x] Levels mapping: `min_xp` DB column mapped to `min` in JS layer on fetch
- [x] Badges mapping: `description` DB column used (replaces old `desc` field)
- [x] STATES and AVATARS remain in App.jsx (static UI data, no DB benefit)
- [x] Fallback data files (`src/data/`) used only when Supabase is null

### Fallback data files (offline only — do NOT add new data here)
- `src/data/questions.js` — original 25 questions, source of truth is Supabase
- `src/data/topics.js` — original 5 topics only, source of truth is Supabase
- `src/data/badges.js` — 8 badges fallback, source of truth is Supabase
- `src/data/levels.js` — 5 levels fallback, source of truth is Supabase

---

## Module 4b — Quiz Engine: Wire to Supabase ✅ 100%

### Done
- [x] `startQuiz()` fetches questions from Supabase when client is available
- [x] Topic filter applied server-side (`eq('topic', topicFilter)`)
- [x] Supabase errors surface as error screen (no silent fallback when configured)
- [x] Local QUESTIONS fallback only fires when `supabase === null` (no .env)
- [x] Loading state shown while questions fetch
- [x] `fetchError` state displays error message to user

### Still to do
- [ ] State filter: `or('states.is.null,states.cs.{stateName}')` — filter by user's state
- [ ] Server-side random sampling (currently shuffles full result client-side)
- [ ] Confirm seed.sql has been run in Supabase SQL editor

---

## Module 4c — Question Bank Expansion ✅ 100% (seeded)

> Questions are in Supabase — future additions are pure SQL INSERTs, no code deploy needed.

### Universal questions (states = null) — in master.sql
- Signs & Signals: ~27 questions
- Right of Way: ~26 questions (+ roundabout lane selection)
- Speed & Space: ~30 questions (+ HOV lanes, ramp meters)
- Parking & Passing: ~26 questions (+ hand signals, passing cyclists)
- Safe Driving: ~25 questions (+ law enforcement stop procedure, ABS technique)
- Vehicle Basics: ~24 questions (+ ABS braking technique)
- Special Situations: ~22 questions
- **Total: ~187 universal questions**

### Nevada-specific questions (states = array['Nevada']) — in master.sql
- Speed limits (7): alleys, residential, school zones, urban/rural interstates, work zones
- BAC / DUI (5): under-21 limit, commercial limit, implied consent, consequences
- Teen / provisional (6): curfew, 50-hour requirement, permit hold, passenger limits
- Move Over Law (3): scope, applies to tow trucks + road maintenance
- Hands-free law (3): all drivers, escalating fines, emergency exception
- Seatbelts (2): primary enforcement, all occupants
- Headlights (2): 1,000 ft visibility rule, wiper-linked requirement
- Parking (4): hydrant, crosswalk, railroad, stop sign distances
- Center turn lane (2): 200 ft entry limit, 50 ft exit limit
- U-turns (2): 200 ft visibility, school zone prohibition
- Left on red (1): one-way to one-way only
- Railroad stop (1): 15 ft minimum distance
- Hazmat/bus railroad (1): must stop even without signal
- Dust storms (4): pull aside, lights off, "Pull Aside Stay Alive"
- Flash floods (4): turn around, 6 inches sweeps a car
- Desert / heat (3): tire pressure, overheating, pre-trip checks
- Open range (3): driver liability, livestock right of way
- Misc Nevada law (6): pedestrian yielding, funeral processions, flashing signals, vulnerable road user law
- **Total: ~60 Nevada-specific questions**

### Still to do (future expansion)
- [ ] Add 10–15 more states with state-specific question sets (similar to Nevada)
- [ ] Grow each topic toward 100 questions for better randomization

---

## Module 5 — Gamification ✅ 100%

### Done
- [x] XP system with earning events (lessons, quizzes)
- [x] 5 driver levels with colors (Learner → Licensed) — loaded from Supabase
- [x] 11 badges with earn conditions — loaded from Supabase
- [x] Daily streak counter
- [x] Streak resets if day missed
- [x] Daily Challenge system — 7-challenge rotation seeded by day-of-year, shown on Dashboard, bonus XP on completion
- [x] Streak freeze item — earned at every 7-day streak milestone, applied automatically when streak would break, shown as 🧊 in header
- [x] Badge unlock animation — full-screen overlay with pop animation, dismisses on tap, queues multiple unlocks
- [x] All previously unawarded badges now wired: streak_3, sign_wizard, speed_demon
- [x] New badges: week_warrior (7-day streak), all_nighter (3 quizzes/day), clean_sweep (pass all topics)

---

## Module 6 — Profile Screen ✅ 100%

### Done
- [x] View and inline-edit name
- [x] State selector (edit mode)
- [x] Avatar car picker
- [x] 4 stat cards (Readiness, Accuracy, Quizzes, Streak)
- [x] XP bar with level progress
- [x] Badge grid (earned/locked states) — uses `badge.description` from Supabase
- [x] Reset progress with confirmation
- [x] Personal Bests card — best score, longest streak ever, total XP earned, quizzes passed
- [x] Lesson completion summary — overall X/Y bar + per-topic mini progress bars
- [x] Quiz history list (full QuizHistoryCard, expandable to 10)
- [x] `bestStreak` tracked in profile and persisted to localStorage

---

## Module 7 — State Coverage ✅ 100%

### Done
- [x] `states[]` column on questions table — null = universal, array = state-specific
- [x] Nevada question set complete (60 questions in master.sql)
- [x] User's state stored in profile (from onboarding)
- [x] State filter wired in quiz engine: `or('states.is.null,states.cs.{"StateName"}')`
- [x] All 50 state thresholds in `STATE_THRESHOLDS` constant
- [x] Mock Test uses user's state question count and pass threshold automatically
- [x] "Did You Know?" card on Dashboard — shows state test format + state law tip
- [x] State questions added: California (10), Texas (8), Florida (7), New York (7), Illinois (6)

---

## Module 8 — Leaderboard & Social ❌ 0%

### Prerequisites
- Module 9 (full backend) must be complete first

### Still to build
- [ ] Friends system — add friends by username, shareable friend code
- [ ] Weekly XP leaderboard (resets every Monday)
- [ ] Global leaderboard filtered by state
- [ ] Opt-in privacy setting
- [ ] Leaderboard tab in bottom nav

---

## Module 9 — Full Backend (Auth + Profile Sync) ❌ 0%

> Questions infrastructure (Modules 4a/4b/4c) already in place.
> This module adds auth and migrates profile/history from localStorage to Supabase.

### Still to build
- [ ] Auth screen (email + Google OAuth) inserted before onboarding for new users
- [ ] Database tables: `profiles`, `quiz_history`, `friendships`
- [ ] Replace localStorage reads/writes with Supabase in profile logic
- [ ] Cross-device sync
- [ ] Push notification reminders
  - [ ] "Don't lose your streak!" daily reminder
  - [ ] "You're 85% ready — book your test!" milestone

---

## Architecture Notes

### File structure (current)
```
src/
├── main.jsx
├── App.jsx              ← all screens + routing + state (~1,400 lines)
├── lib/
│   └── supabase.js      ← Supabase client (null if no .env)
└── data/                ← offline fallbacks only — do NOT add new data
    ├── topics.js        ← 5 original topics
    ├── questions.js     ← 25 original questions
    ├── badges.js        ← 8 badges
    └── levels.js        ← 5 levels
```

### Suggested refactor structure (when App.jsx hits ~2,000 lines)
```
src/
├── App.jsx                  ← shell + routing only
├── lib/
│   └── supabase.js
├── data/                    ← fallbacks only
├── hooks/
│   └── useProfile.js        ← localStorage / Supabase logic
├── components/
│   ├── ReadinessMeter.jsx
│   ├── XPBar.jsx
│   ├── StatCard.jsx
│   └── QuizHistoryCard.jsx
└── screens/
    ├── Onboarding.jsx
    ├── Dashboard.jsx
    ├── Learn.jsx
    ├── Lesson.jsx
    ├── Quiz.jsx
    └── Profile.jsx
```

### Data flow
- App() loads topics + lessons + badges + levels via `Promise.all` on mount
- Data passed as props to all screens — no React Context needed at current scale
- Questions fetched lazily when quiz starts (not preloaded)
- Profile stored in localStorage; migrates to Supabase in Module 9

### Supabase schema summary
| Table | Purpose | RLS |
|-------|---------|-----|
| questions | Question bank | Public read |
| topics | Topic metadata (id, title, icon, color) | Public read |
| lessons | Lesson content (JSONB) | Public read |
| badges | Badge definitions | Public read |
| levels | XP level thresholds | Public read |

---

## Question Bank Expansion Guide

When adding questions to Supabase:

```sql
insert into questions (topic, difficulty, question, options, answer, states) values
('signs', 1, 'Question text?', array['A','B','C','D'], 0, null);
-- states = null → universal (all states)
-- states = array['Nevada'] → Nevada-specific only
```

Difficulty guide:
- **1 (Easy):** Direct recall — "What shape is a stop sign?"
- **2 (Medium):** Apply a rule — "You are facing downhill with a curb. Which way do you turn your wheels?"
- **3 (Hard):** Edge case or exception — "A pedestrian is jaywalking mid-block. Who has right of way?"

Target distribution per topic: 40% easy, 40% medium, 20% hard.
