import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
import { QUESTIONS } from "./data/questions";
import { TOPICS as TOPICS_FALLBACK } from "./data/topics";
import { BADGES as BADGES_FALLBACK } from "./data/badges";
import { LEVELS as LEVELS_FALLBACK } from "./data/levels";

// ── DATA ────────────────────────────────────────────────────────────────────

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming"
];

const AVATARS = ["🚗","🏎️","🚙","🛻","🚐","🚕"];

// DMV written test requirements — verify at your state's official DMV site before relying on these.
const STATE_THRESHOLDS = {
  "Alabama":       { total:40, passing:32 }, "Alaska":        { total:20, passing:16 },
  "Arizona":       { total:30, passing:24 }, "Arkansas":      { total:25, passing:20 },
  "California":    { total:46, passing:38 }, "Colorado":      { total:25, passing:20 },
  "Connecticut":   { total:25, passing:20 }, "Delaware":      { total:30, passing:24 },
  "Florida":       { total:50, passing:40 }, "Georgia":       { total:40, passing:32 },
  "Hawaii":        { total:30, passing:24 }, "Idaho":         { total:40, passing:34 },
  "Illinois":      { total:35, passing:28 }, "Indiana":       { total:50, passing:42 },
  "Iowa":          { total:35, passing:28 }, "Kansas":        { total:25, passing:20 },
  "Kentucky":      { total:40, passing:32 }, "Louisiana":     { total:40, passing:32 },
  "Maine":         { total:30, passing:24 }, "Maryland":      { total:25, passing:22 },
  "Massachusetts": { total:25, passing:18 }, "Michigan":      { total:50, passing:40 },
  "Minnesota":     { total:40, passing:32 }, "Mississippi":   { total:30, passing:24 },
  "Missouri":      { total:25, passing:20 }, "Montana":       { total:33, passing:27 },
  "Nebraska":      { total:25, passing:20 }, "Nevada":        { total:50, passing:40 },
  "New Hampshire": { total:40, passing:32 }, "New Jersey":    { total:50, passing:40 },
  "New Mexico":    { total:25, passing:18 }, "New York":      { total:20, passing:14 },
  "North Carolina":{ total:25, passing:20 }, "North Dakota":  { total:25, passing:20 },
  "Ohio":          { total:40, passing:30 }, "Oklahoma":      { total:50, passing:40 },
  "Oregon":        { total:35, passing:28 }, "Pennsylvania":  { total:18, passing:15 },
  "Rhode Island":  { total:25, passing:20 }, "South Carolina":{ total:30, passing:24 },
  "South Dakota":  { total:25, passing:20 }, "Tennessee":     { total:30, passing:24 },
  "Texas":         { total:30, passing:21 }, "Utah":          { total:25, passing:20 },
  "Vermont":       { total:20, passing:16 }, "Virginia":      { total:35, passing:30 },
  "Washington":    { total:40, passing:32 }, "West Virginia": { total:25, passing:19 },
  "Wisconsin":     { total:50, passing:40 }, "Wyoming":       { total:25, passing:20 },
};

const STATE_FACTS = {
  "California":  "CA teen drivers cannot drive 11 PM–5 AM or carry passengers under 20 for the first 12 months.",
  "Texas":       "TX has a zero-tolerance BAC policy for drivers under 21 — any detectable alcohol is a violation.",
  "Florida":     "FL requires 50 hours of supervised driving (10 at night) before a teen can get a restricted license.",
  "New York":    "NYC has a default speed limit of 25 mph — lower than most cities in the US.",
  "Illinois":    "IL teens cannot drive 10 PM–6 AM on weekdays or midnight–6 AM on weekends for the first year.",
  "Georgia":     "GA Class D license holders can only have 1 passenger under 21 for the first 6 months.",
  "Nevada":      "NV's 'Pull Aside Stay Alive' law: during dust storms you must exit the road and turn off your lights.",
  "Pennsylvania":"PA has one of the shortest written tests — just 18 questions, but you need 15 correct (83%).",
  "Texas":       "TX has some of the highest speed limits in the US — up to 85 mph on certain toll roads.",
  "New Jersey":  "NJ has a 3-stage GDL — permit, probationary, then full license — with no nighttime driving for new teens.",
  "Washington":  "WA requires teen drivers to hold a learner's permit for at least 6 months before getting a license.",
  "Virginia":    "VA has one of the highest passing thresholds — you need 30 out of 35 questions correct (86%).",
  "Michigan":    "MI requires teens to complete a state-approved driver's ed course before getting a license.",
  "Massachusetts":"MA has one of the lowest passing scores — 18 out of 25 questions correct (72%).",
};

const DAILY_CHALLENGES = [
  { type:"quiz_correct", target:5,  label:"Answer 5 questions correctly",  icon:"🎯", xp:75  },
  { type:"lesson",                  label:"Complete any lesson",            icon:"📖", xp:75  },
  { type:"score_80",                label:"Score 80%+ on a Practice quiz", icon:"📝", xp:75  },
  { type:"quiz_correct", target:10, label:"Answer 10 questions correctly", icon:"🎯", xp:100 },
  { type:"mock_pass",               label:"Pass a Mock Test",              icon:"🏆", xp:100 },
  { type:"perfect",                 label:"Get a perfect score on any quiz",icon:"🌟", xp:150 },
  { type:"quiz_correct", target:15, label:"Answer 15 questions correctly", icon:"🎯", xp:125 },
];



// ── HELPERS ──────────────────────────────────────────────────────────────────

function getLevel(xp, levels) {
  let lvl = levels[0];
  for (const l of levels) { if (xp >= l.min) lvl = l; }
  return lvl;
}
function getNextLevel(xp, levels) {
  for (const l of levels) { if (xp < l.min) return l; }
  return null;
}
function xpToNextLevel(xp, levels) {
  const next = getNextLevel(xp, levels);
  if (!next) return { pct: 100, needed: 0, next: null };
  const cur = getLevel(xp, levels);
  const range = next.min - cur.min;
  const progress = xp - cur.min;
  return { pct: Math.round((progress / range) * 100), needed: next.min - xp, next };
}
function getStateThreshold(state) {
  return STATE_THRESHOLDS[state] || { total: 25, passing: 20 };
}

function getDailyChallenge() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}

function calcReadiness(progress, topics) {
  const total = topics.reduce((s, t) => s + t.lessons.length, 0);
  const done = Object.keys(progress.lessons || {}).length;
  const quizAvg = progress.quizScores?.length
    ? progress.quizScores.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, progress.quizScores.length)
    : 0;
  const lessonPct = total > 0 ? (done / total) * 50 : 0;
  const quizPct = quizAvg * 0.5;
  return Math.min(100, Math.round(lessonPct + quizPct));
}

const defaultProfile = {
  name: "", avatar: "🚗", state: "California", xp: 0, streak: 0,
  lastStudy: null, badges: [], lessons: {}, quizScores: [],
  totalQuestions: 0, correctAnswers: 0, quizHistory: [],
  streakFreeze: 0, dailyChallenge: null, bestStreak: 0,
};

// ── STYLES ───────────────────────────────────────────────────────────────────

const css = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Nunito', sans-serif; background: #0f172a; color: #f1f5f9; min-height: 100vh; }
:root {
  --bg: #0f172a; --bg2: #1e293b; --bg3: #334155;
  --accent: #f59e0b; --accent2: #f97316; --green: #10b981;
  --red: #ef4444; --blue: #3b82f6; --purple: #8b5cf6;
  --text: #f1f5f9; --muted: #94a3b8; --border: #334155;
  --radius: 16px; --radius-sm: 10px;
}
.app { max-width: 480px; margin: 0 auto; min-height: 100vh; position: relative; padding-bottom: 80px; }
.screen { padding: 20px; animation: fadeUp 0.3s ease; }
@keyframes fadeUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform:none; } }

/* NAV */
.nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px; background: #1e293b; border-top: 1px solid #334155;
  display: flex; justify-content: space-around; padding: 10px 0 16px; z-index: 100; }
.nav-btn { display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: none; border: none; color: #64748b; cursor: pointer;
  font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 700;
  transition: color 0.2s; padding: 4px 12px; border-radius: 8px; }
.nav-btn.active { color: #f59e0b; }
.nav-btn .icon { font-size: 22px; }

/* CARDS */
.card { background: #1e293b; border-radius: var(--radius); padding: 20px; border: 1px solid #334155; }
.card-sm { background: #1e293b; border-radius: var(--radius-sm); padding: 14px 16px; border: 1px solid #334155; }

/* BUTTONS */
.btn { display: block; width: 100%; padding: 14px 20px; border-radius: 12px; border: none;
  font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 800; cursor: pointer;
  transition: all 0.15s; text-align: center; }
.btn:active { transform: scale(0.97); }
.btn-primary { background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; }
.btn-secondary { background: #334155; color: #f1f5f9; }
.btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
.btn-green { background: linear-gradient(135deg, #10b981, #059669); color: #fff; }
.btn-sm { width: auto; padding: 8px 18px; font-size: 14px; border-radius: 8px; }

/* PROGRESS BARS */
.progress-track { background: #334155; border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 999px; transition: width 0.6s cubic-bezier(.22,1,.36,1); }

/* BADGES */
.badge-pill { display: inline-flex; align-items: center; gap: 6px; background: #334155;
  padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 700; }

/* QUIZ */
.option-btn { width: 100%; text-align: left; padding: 14px 18px; border-radius: 12px;
  border: 2px solid #334155; background: #1e293b; color: #f1f5f9;
  font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.15s; margin-bottom: 10px; }
.option-btn:hover:not(:disabled) { border-color: #f59e0b; background: #27364b; }
.option-btn.correct { border-color: #10b981; background: #064e3b; color: #6ee7b7; }
.option-btn.wrong { border-color: #ef4444; background: #450a0a; color: #fca5a5; }
.option-btn:disabled { cursor: default; }

/* METER */
.meter-ring { position: relative; display: flex; align-items: center; justify-content: center; }

/* LESSON */
.lesson-fact { background: #0f172a; border-left: 3px solid #f59e0b; padding: 10px 14px; border-radius: 0 8px 8px 0; margin: 8px 0; }
.lesson-tip { background: #1c3349; border: 1px solid #2563eb; padding: 10px 14px; border-radius: 8px; margin: 10px 0; }

/* BADGE OVERLAY */
@keyframes badgePop { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.badge-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999;
  background-color: #0a0f1e; display: flex; align-items: center; justify-content: center; }
.badge-pop { animation: badgePop 0.45s cubic-bezier(.34,1.56,.64,1); text-align: center; padding: 24px; max-width: 320px; }
`;

// ── COMPONENTS ───────────────────────────────────────────────────────────────

function ReadinessMeter({ value }) {
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  const color = value < 40 ? "#ef4444" : value < 70 ? "#f59e0b" : "#10b981";
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth={10}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition:"stroke-dashoffset 0.8s cubic-bezier(.22,1,.36,1)" }}/>
        <text x={cx} y={cy-8} textAnchor="middle" fill={color} fontSize={28} fontWeight={900} fontFamily="Fredoka One">{value}</text>
        <text x={cx} y={cy+14} textAnchor="middle" fill="#94a3b8" fontSize={12} fontFamily="Nunito">READY</text>
      </svg>
    </div>
  );
}

function XPBar({ xp, levels }) {
  const { pct, needed, next } = xpToNextLevel(xp, levels);
  const lvl = getLevel(xp, levels);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#94a3b8", marginBottom:6 }}>
        <span style={{ fontWeight:700, color: lvl.color }}>{lvl.name}</span>
        {next && <span>{needed} XP to {next.name}</span>}
      </div>
      <div className="progress-track" style={{ height:8 }}>
        <div className="progress-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg, #f59e0b, #f97316)` }}/>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card-sm" style={{ textAlign:"center" }}>
      <div style={{ fontSize:24 }}>{icon}</div>
      <div style={{ fontSize:22, fontWeight:900, color: color||"#f1f5f9", fontFamily:"Fredoka One" }}>{value}</div>
      <div style={{ fontSize:12, color:"#94a3b8", fontWeight:700 }}>{label}</div>
    </div>
  );
}

// ── SCREENS ──────────────────────────────────────────────────────────────────

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🚗");
  const [state, setState] = useState("California");

  const steps = [
    {
      title: "Welcome to DriveReady! 🚗",
      subtitle: "The fun way to ace your driver's license test.",
      content: (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:80, margin:"20px 0" }}>🏎️</div>
          <p style={{ color:"#94a3b8", lineHeight:1.6 }}>
            Learn the rules of the road, take practice quizzes, earn badges,
            and track your readiness — all in one place.
          </p>
        </div>
      ),
      canProceed: true,
    },
    {
      title: "What's your name?",
      subtitle: "We'll use this for your driver profile.",
      content: (
        <div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name..."
            style={{
              width:"100%", padding:"14px 18px", borderRadius:12, border:"2px solid #334155",
              background:"#0f172a", color:"#f1f5f9", fontSize:16, fontFamily:"Nunito",
              fontWeight:700, outline:"none", marginTop:16,
            }}
          />
          <div style={{ marginTop:20 }}>
            <p style={{ color:"#94a3b8", marginBottom:12, fontWeight:700 }}>Pick your car:</p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {AVATARS.map(a => (
                <button key={a} onClick={() => setAvatar(a)} style={{
                  fontSize:32, padding:"10px 14px", borderRadius:12,
                  border:`2px solid ${avatar===a?"#f59e0b":"#334155"}`,
                  background: avatar===a?"#27364b":"#1e293b", cursor:"pointer",
                  transition:"all 0.15s",
                }}>{a}</button>
              ))}
            </div>
          </div>
        </div>
      ),
      canProceed: name.trim().length > 1,
    },
    {
      title: "Your home state?",
      subtitle: "We'll customize quizzes for your state's DMV test.",
      content: (
        <select value={state} onChange={e => setState(e.target.value)} style={{
          width:"100%", padding:"14px 18px", borderRadius:12, border:"2px solid #334155",
          background:"#0f172a", color:"#f1f5f9", fontSize:16, fontFamily:"Nunito",
          fontWeight:700, outline:"none", marginTop:16, appearance:"none",
        }}>
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>
      ),
      canProceed: true,
    },
  ];

  const cur = steps[step];
  return (
    <div className="screen" style={{ display:"flex", flexDirection:"column", minHeight:"100vh", justifyContent:"center" }}>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ fontFamily:"Fredoka One", fontSize:32, color:"#f59e0b", marginBottom:4 }}>DriveReady</div>
        <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width:8, height:8, borderRadius:"50%",
              background: i<=step?"#f59e0b":"#334155", transition:"background 0.3s" }}/>
          ))}
        </div>
      </div>
      <div className="card" style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:"Fredoka One", fontSize:24, marginBottom:6 }}>{cur.title}</h2>
        <p style={{ color:"#94a3b8", marginBottom:16 }}>{cur.subtitle}</p>
        {cur.content}
      </div>
      <button className="btn btn-primary" disabled={!cur.canProceed}
        style={{ opacity: cur.canProceed?1:0.4 }}
        onClick={() => {
          if (step < steps.length-1) setStep(step+1);
          else onComplete({ name: name.trim(), avatar, state });
        }}>
        {step < steps.length-1 ? "Continue →" : "Let's Go! 🚀"}
      </button>
    </div>
  );
}

function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function modeLabel(mode) {
  return mode === "practice" ? "📝 Practice" : mode === "challenge" ? "⚡ Challenge" : "🏆 Mock Test";
}

function BadgeUnlockOverlay({ badgeId, badges, onDismiss }) {
  const badge = badges.find(b => b.id === badgeId);
  if (!badge) { onDismiss(); return null; }
  return (
    <div className="badge-overlay" onClick={onDismiss}>
      <div className="badge-pop">
        <div style={{ fontSize:96, marginBottom:16 }}>{badge.icon}</div>
        <div style={{ fontFamily:"Fredoka One", fontSize:28, color:"#f59e0b", marginBottom:6 }}>Badge Unlocked!</div>
        <div style={{ fontFamily:"Fredoka One", fontSize:22, marginBottom:8 }}>{badge.name}</div>
        <div style={{ color:"#94a3b8", fontSize:15, marginBottom:28 }}>{badge.description}</div>
        <div style={{ color:"#475569", fontSize:13 }}>Tap anywhere to continue</div>
      </div>
    </div>
  );
}

function QuizHistoryCard({ history, topics }) {
  const [expanded, setExpanded] = useState(false);
  const recent = history.slice(0, expanded ? 10 : 3);

  if (history.length === 0) {
    return (
      <div className="card" style={{ marginBottom:16, textAlign:"center", padding:"24px 20px" }}>
        <div style={{ fontSize:36, marginBottom:8 }}>🎯</div>
        <p style={{ fontWeight:700, marginBottom:4 }}>No quizzes yet</p>
        <p style={{ color:"#94a3b8", fontSize:13 }}>Take your first quiz to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <h3 style={{ fontFamily:"Fredoka One", fontSize:18 }}>Recent Quizzes</h3>
        <span style={{ color:"#94a3b8", fontSize:13, fontWeight:700 }}>{history.length} total</span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {recent.map(entry => {
          const topic = entry.topic && entry.topic !== "all"
            ? topics.find(t => t.id === entry.topic) : null;
          const scoreColor = entry.score >= 80 ? "#10b981" : entry.score >= 60 ? "#f59e0b" : "#ef4444";
          return (
            <div key={entry.id} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"11px 14px", borderRadius:10, background:"#0f172a",
              border:`1px solid ${entry.passed ? "#10b981" : "#334155"}`,
            }}>
              {/* Left: mode + topic + time */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:14, marginBottom:2 }}>
                  {modeLabel(entry.mode)}
                  {topic && (
                    <span style={{ color:"#64748b", fontWeight:600, fontSize:12, marginLeft:6 }}>
                      · {topic.icon} {topic.title}
                    </span>
                  )}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:12, color:"#64748b" }}>
                  <span>{entry.correct}/{entry.total} correct</span>
                  <span>·</span>
                  <span>+{entry.xpEarned} XP</span>
                  <span>·</span>
                  <span>{timeAgo(entry.date)}</span>
                </div>
              </div>
              {/* Right: score ring */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginLeft:12 }}>
                <svg width={44} height={44} viewBox="0 0 44 44">
                  <circle cx={22} cy={22} r={18} fill="none" stroke="#334155" strokeWidth={4}/>
                  <circle cx={22} cy={22} r={18} fill="none" stroke={scoreColor} strokeWidth={4}
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - entry.score / 100)}
                    strokeLinecap="round" transform="rotate(-90 22 22)"
                    style={{ transition:"stroke-dashoffset 0.5s ease" }}/>
                  <text x={22} y={22} textAnchor="middle" dominantBaseline="central"
                    fill={scoreColor} fontSize={11} fontWeight={900} fontFamily="Fredoka One">
                    {entry.score}%
                  </text>
                </svg>
                {entry.passed
                  ? <span style={{ fontSize:10, color:"#10b981", fontWeight:800, marginTop:2 }}>PASS</span>
                  : <span style={{ fontSize:10, color:"#ef4444", fontWeight:800, marginTop:2 }}>RETRY</span>
                }
              </div>
            </div>
          );
        })}
      </div>

      {history.length > 3 && (
        <button onClick={() => setExpanded(e => !e)} style={{
          width:"100%", marginTop:12, padding:"8px", borderRadius:8,
          border:"1px solid #334155", background:"none", color:"#94a3b8",
          fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer",
        }}>
          {expanded ? "Show less ↑" : `Show all ${history.length} quizzes ↓`}
        </button>
      )}
    </div>
  );
}

function DashboardScreen({ profile, setProfile, topics, levels }) {
  const readiness = calcReadiness(profile, topics);
  const lvl = getLevel(profile.xp, levels);
  const doneLessons = Object.keys(profile.lessons||{}).length;
  const accuracy = profile.totalQuestions > 0
    ? Math.round((profile.correctAnswers/profile.totalQuestions)*100) : 0;
  const history = profile.quizHistory || [];

  // Best streak from history for display
  const bestScore = history.length ? Math.max(...history.map(h => h.score)) : null;

  // Find first incomplete topic for recommendation
  const weakTopic = topics.find(t => !(profile.lessons||{})[t.lessons[0]?.id]);

  // Find topic with lowest quiz score from history
  const topicScoreMap = {};
  history.forEach(h => {
    if (h.topic && h.topic !== "all") {
      if (!topicScoreMap[h.topic]) topicScoreMap[h.topic] = [];
      topicScoreMap[h.topic].push(h.score);
    }
  });
  const weakQuizTopic = Object.entries(topicScoreMap)
    .map(([id, scores]) => ({ id, avg: scores.reduce((a,b)=>a+b,0)/scores.length }))
    .sort((a,b)=>a.avg-b.avg)[0];

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"Fredoka One", fontSize:28, color:"#f59e0b" }}>DriveReady</div>
          <div style={{ color:"#94a3b8", fontSize:14 }}>Hey, {profile.name}! {profile.avatar}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontWeight:900, color: lvl.color, fontSize:15 }}>{lvl.name}</div>
          <div style={{ color:"#f59e0b", fontWeight:800, fontSize:13 }}>{profile.xp} XP</div>
          {profile.streak > 0 && (
            <div style={{ color:"#f97316", fontWeight:800, fontSize:13 }}>
              🔥 {profile.streak} day streak
              {(profile.streakFreeze ?? 0) > 0 && <span style={{ marginLeft:6, fontSize:11 }}>🧊×{profile.streakFreeze}</span>}
            </div>
          )}
        </div>
      </div>

      {/* License Meter */}
      <div className="card" style={{ textAlign:"center", marginBottom:16, background:"linear-gradient(135deg,#1e293b,#0f2237)" }}>
        <p style={{ color:"#94a3b8", fontWeight:700, marginBottom:4, fontSize:13 }}>LICENSE READINESS</p>
        <ReadinessMeter value={readiness}/>
        <p style={{ color:"#94a3b8", fontSize:13, marginTop:4 }}>
          {readiness < 40 ? "Keep studying — you've got this! 📚"
            : readiness < 70 ? "Good progress! Keep quizzing 💪"
            : readiness < 90 ? "Almost ready — push for 90%! 🚦"
            : "You're ready to book your test! 🏆"}
        </p>
      </div>

      {/* XP Bar */}
      <div className="card-sm" style={{ marginBottom:16 }}>
        <XPBar xp={profile.xp} levels={levels}/>
      </div>

      {/* Stats Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:16 }}>
        <StatCard label="Lessons" value={doneLessons} icon="📖" color="#3b82f6"/>
        <StatCard label="Accuracy" value={`${accuracy}%`} icon="🎯" color="#10b981"/>
        <StatCard label="Badges" value={(profile.badges||[]).length} icon="🏅" color="#f59e0b"/>
        <StatCard label="Best Score" value={bestScore !== null ? `${bestScore}%` : "—"} icon="⭐" color="#8b5cf6"/>
      </div>

      {/* Recommendation */}
      {(weakTopic || weakQuizTopic) && (
        <div className="card" style={{ borderColor:"#f59e0b", borderWidth:2, marginBottom:16 }}>
          <p style={{ color:"#f59e0b", fontWeight:800, fontSize:12, marginBottom:6, letterSpacing:"0.05em" }}>
            📌 RECOMMENDED NEXT STEP
          </p>
          {weakQuizTopic && weakQuizTopic.avg < 70 ? (() => {
            const t = topics.find(tp => tp.id === weakQuizTopic.id);
            return t ? (
              <>
                <p style={{ fontWeight:700 }}>{t.icon} Practice "{t.title}"</p>
                <p style={{ color:"#94a3b8", fontSize:13 }}>
                  Your average score here is {Math.round(weakQuizTopic.avg)}% — aim for 80%+.
                </p>
              </>
            ) : null;
          })() : weakTopic ? (
            <>
              <p style={{ fontWeight:700 }}>{weakTopic.icon} Start "{weakTopic.title}"</p>
              <p style={{ color:"#94a3b8", fontSize:13 }}>You haven't studied this topic yet.</p>
            </>
          ) : null}
        </div>
      )}

      {/* Did You Know */}
      {(() => {
        const t = getStateThreshold(profile.state);
        const fact = STATE_FACTS[profile.state];
        return (
          <div className="card-sm" style={{ marginBottom:16, borderLeft:"3px solid #3b82f6" }}>
            <p style={{ color:"#3b82f6", fontWeight:800, fontSize:11, marginBottom:5, letterSpacing:"0.05em" }}>
              💡 DID YOU KNOW · {profile.state.toUpperCase()}
            </p>
            <p style={{ fontSize:13, color:"#cbd5e1", lineHeight:1.6, marginBottom:fact?6:0 }}>
              Your DMV test has <b>{t.total} questions</b> — you need <b>{t.passing} correct</b> ({Math.round(t.passing/t.total*100)}%) to pass.
            </p>
            {fact && <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6 }}>{fact}</p>}
          </div>
        );
      })()}

      {/* Topic Progress */}
      <div className="card" style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:"Fredoka One", marginBottom:14, fontSize:18 }}>Topic Progress</h3>
        {topics.map(topic => {
          const done = topic.lessons.filter(l => (profile.lessons||{})[l.id]).length;
          const pct = Math.round((done/topic.lessons.length)*100);
          const topicHistory = history.filter(h => h.topic === topic.id);
          const topicAvg = topicHistory.length
            ? Math.round(topicHistory.reduce((a,b)=>a+b.score,0)/topicHistory.length) : null;
          return (
            <div key={topic.id} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:700, marginBottom:5 }}>
                <span>{topic.icon} {topic.title}</span>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  {topicAvg !== null && (
                    <span style={{ fontSize:12, color: topicAvg>=80?"#10b981":topicAvg>=60?"#f59e0b":"#ef4444",
                      fontWeight:800 }}>
                      avg {topicAvg}%
                    </span>
                  )}
                  <span style={{ color: pct===100?"#10b981":"#94a3b8" }}>{done}/{topic.lessons.length}</span>
                </div>
              </div>
              <div className="progress-track" style={{ height:6 }}>
                <div className="progress-fill" style={{ width:`${pct}%`, background:topic.color }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Challenge */}
      {(() => {
        const challenge = getDailyChallenge();
        const today = new Date().toDateString();
        const dc = profile.dailyChallenge && profile.dailyChallenge.date === today
          ? profile.dailyChallenge : { progress: 0, completed: false };
        return (
          <div className="card" style={{ marginBottom:16,
            borderColor: dc.completed ? "#10b981" : "#f59e0b", borderWidth: dc.completed ? 1 : 2 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <span style={{ color:"#f59e0b", fontWeight:800, fontSize:12, letterSpacing:"0.05em" }}>
                ⚡ DAILY CHALLENGE
              </span>
              {dc.completed
                ? <span style={{ color:"#10b981", fontWeight:800, fontSize:12 }}>✅ COMPLETE</span>
                : <span style={{ color:"#f59e0b", fontWeight:800, fontSize:12 }}>+{challenge.xp} XP</span>}
            </div>
            <p style={{ fontWeight:700, marginBottom:6 }}>{challenge.icon} {challenge.label}</p>
            {challenge.type === "quiz_correct" && !dc.completed && (
              <>
                <div className="progress-track" style={{ height:6, marginBottom:5 }}>
                  <div className="progress-fill" style={{
                    width:`${Math.min(100, ((dc.progress||0) / challenge.target) * 100)}%`,
                    background:"linear-gradient(90deg,#f59e0b,#f97316)"
                  }}/>
                </div>
                <p style={{ fontSize:12, color:"#94a3b8" }}>{dc.progress||0}/{challenge.target} correct</p>
              </>
            )}
          </div>
        );
      })()}

      {/* Quiz History */}
      <QuizHistoryCard history={history} topics={topics}/>
    </div>
  );
}

function LearnScreen({ profile, setProfile, onStartLesson, topics }) {
  return (
    <div className="screen">
      <h2 style={{ fontFamily:"Fredoka One", fontSize:28, marginBottom:6 }}>Learn 📚</h2>
      <p style={{ color:"#94a3b8", marginBottom:20 }}>Master the rules of the road, one topic at a time.</p>
      {topics.map(topic => {
        const done = topic.lessons.filter(l => (profile.lessons||{})[l.id]).length;
        const pct = Math.round((done/topic.lessons.length)*100);
        return (
          <div key={topic.id} className="card" style={{ marginBottom:14, borderLeft:`4px solid ${topic.color}` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:28 }}>{topic.icon}</span>
                <div>
                  <div style={{ fontFamily:"Fredoka One", fontSize:18 }}>{topic.title}</div>
                  <div style={{ color:"#94a3b8", fontSize:13 }}>{topic.lessons.length} lessons</div>
                </div>
              </div>
              <div style={{ fontWeight:900, color: pct===100?"#10b981":"#94a3b8" }}>
                {pct===100?"✅":""}  {done}/{topic.lessons.length}
              </div>
            </div>
            <div className="progress-track" style={{ height:5, marginBottom:12 }}>
              <div className="progress-fill" style={{ width:`${pct}%`, background:topic.color }}/>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {topic.lessons.map(lesson => {
                const isDone = !!(profile.lessons||{})[lesson.id];
                return (
                  <button key={lesson.id} onClick={() => onStartLesson(topic, lesson)} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"10px 14px", borderRadius:10, border:`1px solid ${isDone?"#10b981":"#334155"}`,
                    background: isDone?"#064e3b":"#0f172a", cursor:"pointer", color:"#f1f5f9",
                    fontFamily:"Nunito", fontSize:14, fontWeight:700, transition:"all 0.15s",
                  }}>
                    <span>{isDone?"✅":"📄"} {lesson.title}</span>
                    <span style={{ color:"#94a3b8" }}>→</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LessonScreen({ topic, lesson, profile, setProfile, onBack }) {
  const [page, setPage] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizDone, setQuizDone] = useState(false);
  const [miniQs, setMiniQs] = useState([]);
  const [miniLoading, setMiniLoading] = useState(false);

  async function startMiniQuiz() {
    setMiniLoading(true);
    let pool = [];
    if (supabase) {
      const { data } = await supabase.from("questions").select("*").eq("topic", topic.id).limit(30);
      pool = data?.length ? data.sort(() => Math.random() - 0.5).slice(0, 3) : [];
    }
    if (!pool.length) {
      pool = QUESTIONS.filter(q => q.topic === topic.id).sort(() => Math.random() - 0.5).slice(0, 3);
    }
    setMiniQs(pool);
    setMiniLoading(false);
    setShowQuiz(true);
  }

  function markComplete() {
    const newLessons = { ...(profile.lessons||{}), [lesson.id]: true };
    let xpGained = 50;
    let badges = [...(profile.badges||[])];
    const doneLessons = Object.keys(newLessons).length;
    if (doneLessons >= 5 && !badges.includes("lesson_5")) badges.push("lesson_5");

    const today = new Date().toDateString();
    const challenge = getDailyChallenge();
    let dc = profile.dailyChallenge && profile.dailyChallenge.date === today
      ? profile.dailyChallenge : { date: today, progress: 0, completed: false };
    if (!dc.completed && challenge.type === "lesson") {
      dc = { ...dc, completed: true };
      xpGained += challenge.xp;
    }

    const newXp = profile.xp + xpGained;
    if (newXp >= 500 && !badges.includes("xp_500")) badges.push("xp_500");
    setProfile(p => ({ ...p, lessons: newLessons, xp: newXp, badges, dailyChallenge: dc }));
    onBack();
  }

  if (!showQuiz) {
    const items = lesson.content;
    return (
      <div className="screen">
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#94a3b8",
          cursor:"pointer", fontSize:14, fontWeight:700, marginBottom:16 }}>← Back</button>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <span style={{ fontSize:32 }}>{topic.icon}</span>
          <div>
            <div style={{ color:"#94a3b8", fontSize:13 }}>{topic.title}</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:22 }}>{lesson.title}</h2>
          </div>
        </div>
        <div className="card" style={{ marginBottom:20 }}>
          {items.map((item,i) => {
            if (item.type==="heading") return <h3 key={i} style={{ fontFamily:"Fredoka One", fontSize:20, marginBottom:12, color:"#f59e0b" }}>{item.text}</h3>;
            if (item.type==="text") return <p key={i} style={{ color:"#cbd5e1", lineHeight:1.7, marginBottom:14 }}>{item.text}</p>;
            if (item.type==="fact") return (
              <div key={i} className="lesson-fact">
                <span style={{ fontWeight:900, color:"#f59e0b" }}>{item.label}: </span>
                <span style={{ color:"#cbd5e1", fontSize:14 }}>{item.text}</span>
              </div>
            );
            if (item.type==="tip") return (
              <div key={i} className="lesson-tip">
                <span style={{ fontWeight:900, color:"#60a5fa" }}>💡 Pro Tip: </span>
                <span style={{ color:"#cbd5e1", fontSize:14 }}>{item.text}</span>
              </div>
            );
            if (item.type==="image") return (
              <div key={i} style={{ textAlign:"center", margin:"14px 0" }}>
                <img src={item.src?.startsWith("/") ? `${import.meta.env.BASE_URL}${item.src.slice(1)}` : item.src} alt={item.alt || ""} style={{ maxWidth:"100%", borderRadius:8, border:"1px solid #334155" }}/>
                {item.caption && <p style={{ fontSize:12, color:"#94a3b8", marginTop:6, fontStyle:"italic" }}>{item.caption}</p>}
              </div>
            );
            return null;
          })}
        </div>
        <button className="btn btn-primary" onClick={startMiniQuiz} disabled={miniLoading}>
          {miniLoading ? "Loading…" : "Take Mini-Check Quiz →"}
        </button>
      </div>
    );
  }

  // Mini quiz
  function handleAnswer(qi, ai) {
    if (quizAnswers[qi] !== undefined) return;
    setQuizAnswers(prev => {
      const next = { ...prev, [qi]: ai };
      if (Object.keys(next).length === miniQs.length) setQuizDone(true);
      return next;
    });
  }

  const score = Object.entries(quizAnswers).filter(([qi,ai]) => miniQs[qi]?.answer === ai).length;

  return (
    <div className="screen">
      <button onClick={() => setShowQuiz(false)} style={{ background:"none", border:"none", color:"#94a3b8",
        cursor:"pointer", fontSize:14, fontWeight:700, marginBottom:16 }}>← Back to Lesson</button>
      <h2 style={{ fontFamily:"Fredoka One", fontSize:24, marginBottom:4 }}>Mini Check ✍️</h2>
      <p style={{ color:"#94a3b8", marginBottom:20 }}>{miniQs.length} quick questions on what you just learned.</p>

      {miniQs.length === 0 && (
        <div className="card" style={{ textAlign:"center" }}>
          <p style={{ color:"#94a3b8" }}>No questions available for this topic yet.</p>
          <button className="btn btn-primary" style={{ marginTop:12 }} onClick={markComplete}>
            Mark Complete (+50 XP) →
          </button>
        </div>
      )}

      {miniQs.map((q,qi) => (
        <div key={q.id} className="card" style={{ marginBottom:14 }}>
          <p style={{ fontWeight:700, marginBottom:14, lineHeight:1.5 }}>{qi+1}. {q.question}</p>
          {q.options.map((opt,ai) => {
            const answered = quizAnswers[qi] !== undefined;
            const selected = quizAnswers[qi] === ai;
            const correct = q.answer === ai;
            let cls = "option-btn";
            if (answered) cls += correct?" correct": selected?" wrong":"";
            return (
              <button key={ai} className={cls} disabled={answered} onClick={() => handleAnswer(qi,ai)}>
                {opt}
              </button>
            );
          })}
          {quizAnswers[qi] !== undefined && (
            <p style={{ fontSize:13, color: quizAnswers[qi]===q.answer?"#10b981":"#f87171",
              fontWeight:700, marginTop:4 }}>
              {quizAnswers[qi]===q.answer ? "✅ Correct!" : `❌ Answer: ${q.options[q.answer]}`}
            </p>
          )}
        </div>
      ))}

      {quizDone && (
        <div className="card" style={{ textAlign:"center", borderColor: score===miniQs.length?"#10b981":"#f59e0b", borderWidth:2 }}>
          <div style={{ fontSize:48 }}>{score===miniQs.length?"🌟":"📈"}</div>
          <div style={{ fontFamily:"Fredoka One", fontSize:28, color: score===miniQs.length?"#10b981":"#f59e0b" }}>
            {score}/{miniQs.length}
          </div>
          <p style={{ color:"#94a3b8", marginBottom:16 }}>
            {score===miniQs.length?"Perfect! +50 XP earned 🎉":"Lesson complete! +50 XP earned"}
          </p>
          <button className="btn btn-primary" onClick={markComplete}>
            Continue (+50 XP) →
          </button>
        </div>
      )}
    </div>
  );
}

function QuizScreen({ profile, setProfile, topics }) {
  const [mode, setMode] = useState(null); // null | 'practice' | 'challenge' | 'mock'
  const [topicFilter, setTopicFilter] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const timerRef = useRef(null);

  async function startQuiz(m) {
    const threshold = getStateThreshold(profile.state);
    const count = m==="mock" ? threshold.total : m==="challenge" ? 20 : 10;
    setFetchError(null);

    // No Supabase configured — use local fallback (dev without .env)
    if (!supabase) {
      let local = [...QUESTIONS];
      if (m === "practice" && topicFilter !== "all") local = local.filter(q => q.topic === topicFilter);
      const pool = local.sort(() => Math.random() - 0.5).slice(0, count);
      _launchQuiz(m, pool);
      return;
    }

    setLoading(true);
    let query = supabase.from("questions").select("*");
    if (m === "practice" && topicFilter !== "all") {
      query = query.eq("topic", topicFilter);
    }
    query = query.or(`states.is.null,states.cs.{"${profile.state}"}`);
    const { data, error } = await query;
    setLoading(false);

    if (error || !data?.length) {
      setFetchError(error?.message || "No questions returned from database.");
      return;
    }

    const pool = data.sort(() => Math.random() - 0.5).slice(0, count);
    _launchQuiz(m, pool);
  }

  function _launchQuiz(m, pool) {
    setQuestions(pool);
    setCurrent(0);
    setAnswers({});
    setDone(false);
    setHintUsed(false);
    setTimeLeft(m==="mock" ? 1800 : m==="challenge" ? 900 : 0);
    setMode(m);
  }

  useEffect(() => {
    if (timeLeft > 0 && !done) {
      timerRef.current = setTimeout(() => setTimeLeft(t=>t-1), 1000);
    } else if (timeLeft===0 && mode && mode!=="practice" && questions.length && !done) {
      if (Object.keys(answers).length > 0) finishQuiz(answers);
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, done]);

  function handleAnswer(ai) {
    if (answers[current] !== undefined) return;
    const newAnswers = { ...answers, [current]: ai };
    setAnswers(newAnswers);
    if (mode==="practice") {
      // stay on question for a moment then advance
      if (current < questions.length-1) {
        setTimeout(() => setCurrent(c=>c+1), 1200);
      } else {
        setTimeout(() => finishQuiz(newAnswers), 1200);
      }
    } else {
      if (current < questions.length-1) setCurrent(c=>c+1);
      else finishQuiz(newAnswers);
    }
  }

  function finishQuiz(ans) {
    clearTimeout(timerRef.current);
    setDone(true);
    const correct = Object.entries(ans).filter(([i,a]) => questions[i]?.answer===a).length;
    const pct = Math.round((correct/questions.length)*100);
    const threshold = getStateThreshold(profile.state);
    const passed = mode === "mock" ? correct >= threshold.passing : pct >= 80;
    let xpEarned = correct * 10 + (pct===100?50:0);

    // Daily challenge progress
    const today = new Date().toDateString();
    const challenge = getDailyChallenge();
    let dc = profile.dailyChallenge && profile.dailyChallenge.date === today
      ? profile.dailyChallenge : { date: today, progress: 0, completed: false };
    if (!dc.completed) {
      if (challenge.type === "quiz_correct") {
        const newProgress = (dc.progress || 0) + correct;
        if (newProgress >= challenge.target) {
          dc = { ...dc, progress: newProgress, completed: true };
          xpEarned += challenge.xp;
        } else {
          dc = { ...dc, progress: newProgress };
        }
      } else if (challenge.type === "score_80" && pct >= 80 && mode === "practice") {
        dc = { ...dc, completed: true };
        xpEarned += challenge.xp;
      } else if (challenge.type === "mock_pass" && passed && mode === "mock") {
        dc = { ...dc, completed: true };
        xpEarned += challenge.xp;
      } else if (challenge.type === "perfect" && pct === 100) {
        dc = { ...dc, completed: true };
        xpEarned += challenge.xp;
      }
    }

    // Badge checks
    let badges = [...(profile.badges||[])];
    if (!badges.includes("first_quiz")) badges.push("first_quiz");
    if (pct === 100 && !badges.includes("perfect_run")) badges.push("perfect_run");
    if (passed && mode === "mock" && !badges.includes("mock_pass")) badges.push("mock_pass");
    if (pct === 100 && topicFilter === "signs" && !badges.includes("sign_wizard")) badges.push("sign_wizard");
    // speed_demon: finish a timed quiz with 5+ min (300s) remaining
    if (timeLeft > 300 && mode !== "practice" && !badges.includes("speed_demon")) badges.push("speed_demon");
    // all_nighter: 3 quizzes in one day
    const todayCount = (profile.quizHistory||[]).filter(h => new Date(h.date).toDateString() === today).length + 1;
    if (todayCount >= 3 && !badges.includes("all_nighter")) badges.push("all_nighter");
    // clean_sweep: pass all topics in practice quizzes
    const topicsPassed = new Set((profile.quizHistory||[]).filter(h => h.passed && h.topic !== "all").map(h => h.topic));
    if (passed && topicFilter !== "all") topicsPassed.add(topicFilter);
    if (topics.length > 0 && topics.every(t => topicsPassed.has(t.id)) && !badges.includes("clean_sweep")) badges.push("clean_sweep");

    const newXp = profile.xp + xpEarned;
    if (newXp >= 500 && !badges.includes("xp_500")) badges.push("xp_500");

    const newScores = [...(profile.quizScores||[]), pct];
    const historyEntry = {
      id: Date.now(), mode, topic: topicFilter, score: pct, correct,
      total: questions.length, xpEarned, passed,
      date: new Date().toISOString(),
    };
    setProfile(p => ({
      ...p, xp: newXp, badges, quizScores: newScores,
      totalQuestions: (p.totalQuestions||0) + questions.length,
      correctAnswers: (p.correctAnswers||0) + correct,
      quizHistory: [historyEntry, ...(p.quizHistory||[])].slice(0, 20),
      dailyChallenge: dc,
    }));
  }

  function formatTime(s) {
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  }

  if (loading) {
    return (
      <div className="screen" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", gap:16 }}>
        <div style={{ fontSize:48 }}>🚗</div>
        <p style={{ fontFamily:"Fredoka One", fontSize:22, color:"#f59e0b" }}>Loading questions...</p>
        <p style={{ color:"#94a3b8", fontSize:13 }}>Fetching from the question bank</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="screen" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", gap:16 }}>
        <div style={{ fontSize:48 }}>⚠️</div>
        <p style={{ fontFamily:"Fredoka One", fontSize:22, color:"#ef4444" }}>Couldn't load questions</p>
        <p style={{ color:"#94a3b8", fontSize:13, textAlign:"center", maxWidth:300 }}>{fetchError}</p>
        <button className="btn btn-primary" style={{ width:"auto", padding:"12px 28px" }}
          onClick={() => setFetchError(null)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="screen">
        <h2 style={{ fontFamily:"Fredoka One", fontSize:28, marginBottom:6 }}>Quiz 🎯</h2>
        <p style={{ color:"#94a3b8", marginBottom:20 }}>Test your knowledge in three modes.</p>

        {(() => {
          const t = getStateThreshold(profile.state);
          return [
            { id:"practice", icon:"📝", title:"Practice Mode", desc:"10 questions, untimed. Pick a topic. Learn as you go.", color:"#3b82f6" },
            { id:"challenge", icon:"⚡", title:"Challenge Mode", desc:"20 mixed questions. 15-minute timer. Use XP hints!", color:"#f59e0b" },
            { id:"mock", icon:"🏆", title:"Mock Test", desc:`${t.total} questions · need ${t.passing} correct · 30 min · ${profile.state} format`, color:"#10b981" },
          ];
        })().map(m => (
          <div key={m.id} className="card" style={{ marginBottom:14, borderLeft:`4px solid ${m.color}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <span style={{ fontSize:32 }}>{m.icon}</span>
              <div>
                <div style={{ fontFamily:"Fredoka One", fontSize:18 }}>{m.title}</div>
                <div style={{ color:"#94a3b8", fontSize:13 }}>{m.desc}</div>
              </div>
            </div>
            {m.id==="practice" && (
              <select value={topicFilter} onChange={e=>setTopicFilter(e.target.value)}
                style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid #334155",
                  background:"#0f172a", color:"#f1f5f9", fontFamily:"Nunito", fontWeight:700,
                  marginBottom:10, fontSize:14 }}>
                <option value="all">All Topics</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.icon} {t.title}</option>)}
              </select>
            )}
            <button className="btn btn-sm btn-primary" onClick={() => startQuiz(m.id)}>
              Start {m.title} →
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (done) {
    const correct = Object.entries(answers).filter(([i,a]) => questions[i]?.answer===a).length;
    const pct = Math.round((correct/questions.length)*100);
    const threshold = getStateThreshold(profile.state);
    const pass = mode === "mock" ? correct >= threshold.passing : pct >= 80;
    return (
      <div className="screen">
        <div className="card" style={{ textAlign:"center", marginBottom:20,
          borderColor: pass?"#10b981":"#ef4444", borderWidth:2 }}>
          <div style={{ fontSize:64 }}>{pct===100?"🌟":pass?"🎉":"📖"}</div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:32, color: pass?"#10b981":"#ef4444" }}>
            {pct}%
          </h2>
          <p style={{ color:"#94a3b8", marginBottom:4 }}>{correct}/{questions.length} correct</p>
          {mode === "mock" && (
            <p style={{ color:"#475569", fontSize:12, marginBottom:4 }}>
              {profile.state} requires {threshold.passing}/{threshold.total} to pass
            </p>
          )}
          <p style={{ fontWeight:700, color: pass?"#10b981":"#f87171" }}>
            {pass ? "✅ Passed!" : "❌ Keep Studying"}</p>
          <p style={{ color:"#94a3b8", fontSize:13, marginTop:8 }}>
            +{correct*10 + (pct===100?50:0)} XP earned
          </p>
        </div>

        <div className="card" style={{ marginBottom:16 }}>
          <h3 style={{ fontFamily:"Fredoka One", marginBottom:12 }}>Review Answers</h3>
          {questions.map((q,i) => {
            const userAns = answers[i];
            const correct = userAns===q.answer;
            return (
              <div key={q.id} style={{ marginBottom:14, paddingBottom:14,
                borderBottom: i<questions.length-1?"1px solid #334155":"none" }}>
                <p style={{ fontSize:14, fontWeight:700, marginBottom:6, lineHeight:1.5 }}>
                  <span style={{ color: correct?"#10b981":"#f87171" }}>{correct?"✅":"❌"}</span> {q.question}
                </p>
                <p style={{ fontSize:13, color:"#94a3b8" }}>
                  Your answer: <span style={{ color: correct?"#10b981":"#f87171", fontWeight:700 }}>
                    {q.options[userAns] ?? "Skipped"}
                  </span>
                </p>
                {!correct && (
                  <p style={{ fontSize:13, color:"#10b981" }}>
                    Correct: <b>{q.options[q.answer]}</b>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary" onClick={() => setMode(null)}>
          Back to Quiz Menu
        </button>
      </div>
    );
  }

  const q = questions[current];
  const answered = answers[current] !== undefined;

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <button onClick={() => setMode(null)} style={{ background:"none", border:"none",
          color:"#94a3b8", cursor:"pointer", fontSize:14, fontWeight:700 }}>✕ Quit</button>
        <div style={{ fontFamily:"Fredoka One", color:"#f59e0b" }}>
          {current+1}/{questions.length}
        </div>
        {timeLeft > 0 && (
          <div style={{ fontWeight:900, color: timeLeft<60?"#ef4444":"#94a3b8" }}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="progress-track" style={{ height:5, marginBottom:20 }}>
        <div className="progress-fill" style={{ width:`${((current+1)/questions.length)*100}%`,
          background:"linear-gradient(90deg,#f59e0b,#f97316)" }}/>
      </div>

      {/* Mode badge */}
      <div style={{ marginBottom:14 }}>
        <span className="badge-pill" style={{ background:"#334155", fontSize:12 }}>
          {mode==="practice"?"📝 Practice":mode==="challenge"?"⚡ Challenge":"🏆 Mock Test"}
        </span>
        {" "}
        <span className="badge-pill" style={{ background:"#1e293b", fontSize:12, color:"#94a3b8" }}>
          {topics.find(t=>t.id===q.topic)?.icon} {topics.find(t=>t.id===q.topic)?.title}
        </span>
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom:20 }}>
        <p style={{ fontSize:18, fontWeight:800, lineHeight:1.5 }}>{q.question}</p>
      </div>

      {/* Options */}
      {q.options.map((opt,ai) => {
        let cls = "option-btn";
        if (answered) {
          if (ai===q.answer) cls+=" correct";
          else if (ai===answers[current]) cls+=" wrong";
        }
        return (
          <button key={ai} className={cls} disabled={answered} onClick={() => handleAnswer(ai)}>
            <span style={{ color:"#64748b", marginRight:10, fontWeight:900 }}>
              {["A","B","C","D"][ai]}.
            </span>
            {opt}
          </button>
        );
      })}

      {answered && (
        <div style={{ marginTop:10, padding:"12px 16px", borderRadius:10,
          background: answers[current]===q.answer?"#064e3b":"#450a0a",
          color: answers[current]===q.answer?"#6ee7b7":"#fca5a5",
          fontWeight:700, fontSize:14 }}>
          {answers[current]===q.answer ? "✅ Correct! +10 XP" : `❌ Correct answer: ${q.options[q.answer]}`}
        </div>
      )}
    </div>
  );
}

function ProfileScreen({ profile, setProfile, badges, levels, topics }) {
  const readiness = calcReadiness(profile, topics);
  const accuracy = profile.totalQuestions>0
    ? Math.round((profile.correctAnswers/profile.totalQuestions)*100) : 0;
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempState, setTempState] = useState(profile.state);

  const history = profile.quizHistory || [];
  const totalLessons = topics.reduce((s, t) => s + t.lessons.length, 0);
  const doneLessons = Object.keys(profile.lessons || {}).length;
  const bestScore = history.length ? Math.max(...history.map(h => h.score)) : null;
  const bestStreak = Math.max(profile.streak || 0, profile.bestStreak || 0);
  const totalXpEarned = history.reduce((s, h) => s + (h.xpEarned || 0), 0) + doneLessons * 50;

  return (
    <div className="screen">
      {/* Profile header */}
      <div className="card" style={{ textAlign:"center", marginBottom:16,
        background:"linear-gradient(135deg, #1e293b, #0f2237)" }}>
        <div style={{ fontSize:56, marginBottom:8 }}>{profile.avatar}</div>
        {editing ? (
          <div>
            <input value={tempName} onChange={e=>setTempName(e.target.value)}
              style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:8,
                padding:"8px 14px", color:"#f1f5f9", fontFamily:"Nunito", fontWeight:700,
                fontSize:18, width:"100%", textAlign:"center", marginBottom:10 }}/>
            <select value={tempState} onChange={e=>setTempState(e.target.value)}
              style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:8,
                padding:"8px 14px", color:"#f1f5f9", fontFamily:"Nunito", fontWeight:700,
                fontSize:14, width:"100%", marginBottom:14 }}>
              {STATES.map(s=><option key={s}>{s}</option>)}
            </select>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-primary btn-sm" onClick={() => {
                setProfile(p=>({...p, name:tempName, state:tempState}));
                setEditing(false);
              }}>Save</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:26 }}>{profile.name}</h2>
            <p style={{ color:"#94a3b8" }}>📍 {profile.state}</p>
            <div style={{ marginTop:8 }}>
              <span style={{ fontWeight:900, color: getLevel(profile.xp, levels).color }}>
                {getLevel(profile.xp, levels).name}
              </span>
              {" · "}
              <span style={{ color:"#f59e0b", fontWeight:800 }}>{profile.xp} XP</span>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop:12 }}
              onClick={() => setEditing(true)}>✏️ Edit Profile</button>
          </>
        )}
      </div>

      {/* Avatar picker */}
      <div className="card-sm" style={{ marginBottom:16 }}>
        <p style={{ fontWeight:800, marginBottom:10 }}>Choose your car:</p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {AVATARS.map(a => (
            <button key={a} onClick={() => setProfile(p=>({...p, avatar:a}))} style={{
              fontSize:28, padding:"8px 12px", borderRadius:10,
              border:`2px solid ${profile.avatar===a?"#f59e0b":"#334155"}`,
              background: profile.avatar===a?"#27364b":"#1e293b",
              cursor:"pointer", transition:"all 0.15s",
            }}>{a}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        <StatCard label="Readiness" value={`${readiness}%`} icon="🚦" color={readiness>=70?"#10b981":"#f59e0b"}/>
        <StatCard label="Accuracy" value={`${accuracy}%`} icon="🎯" color="#3b82f6"/>
        <StatCard label="Quizzes Taken" value={history.length} icon="📝" color="#8b5cf6"/>
        <StatCard label="Streak" value={`${profile.streak||0}🔥`} icon="📅" color="#f97316"/>
      </div>

      {/* XP */}
      <div className="card-sm" style={{ marginBottom:16 }}>
        <XPBar xp={profile.xp} levels={levels}/>
      </div>

      {/* Personal Bests */}
      <div className="card" style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:"Fredoka One", fontSize:18, marginBottom:12 }}>Personal Bests 🏆</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { label:"Best Quiz Score", value: bestScore !== null ? `${bestScore}%` : "—", icon:"⭐", color:"#f59e0b" },
            { label:"Longest Streak", value: bestStreak > 0 ? `${bestStreak} days` : "—", icon:"🔥", color:"#f97316" },
            { label:"Total XP Earned", value: `${totalXpEarned}`, icon:"💎", color:"#8b5cf6" },
            { label:"Quizzes Passed", value: history.filter(h=>h.passed).length, icon:"✅", color:"#10b981" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"10px 14px", borderRadius:10, background:"#0f172a", border:"1px solid #334155" }}>
              <span style={{ fontSize:13, color:"#94a3b8", fontWeight:700 }}>{icon} {label}</span>
              <span style={{ fontWeight:900, color, fontFamily:"Fredoka One", fontSize:18 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lesson Completion */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <h3 style={{ fontFamily:"Fredoka One", fontSize:18 }}>Lessons 📖</h3>
          <span style={{ fontFamily:"Fredoka One", fontSize:20, color: doneLessons===totalLessons?"#10b981":"#f59e0b" }}>
            {doneLessons}/{totalLessons}
          </span>
        </div>
        <div className="progress-track" style={{ height:8, marginBottom:10 }}>
          <div className="progress-fill" style={{
            width:`${totalLessons>0?Math.round((doneLessons/totalLessons)*100):0}%`,
            background: doneLessons===totalLessons
              ? "linear-gradient(90deg,#10b981,#059669)"
              : "linear-gradient(90deg,#f59e0b,#f97316)"
          }}/>
        </div>
        {topics.map(topic => {
          const done = topic.lessons.filter(l => (profile.lessons||{})[l.id]).length;
          const pct = Math.round((done/topic.lessons.length)*100);
          return (
            <div key={topic.id} style={{ display:"flex", alignItems:"center", gap:10,
              marginBottom:8, fontSize:13 }}>
              <span style={{ width:20, textAlign:"center" }}>{topic.icon}</span>
              <div style={{ flex:1 }}>
                <div className="progress-track" style={{ height:5 }}>
                  <div className="progress-fill" style={{ width:`${pct}%`, background:topic.color }}/>
                </div>
              </div>
              <span style={{ color: pct===100?"#10b981":"#94a3b8", fontWeight:700, minWidth:36, textAlign:"right" }}>
                {done}/{topic.lessons.length}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quiz History */}
      <QuizHistoryCard history={history} topics={topics}/>

      {/* Badges */}
      <div className="card" style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:"Fredoka One", fontSize:20, marginBottom:14 }}>Badges 🏅</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {badges.map(badge => {
            const earned = (profile.badges||[]).includes(badge.id);
            return (
              <div key={badge.id} style={{
                padding:"12px", borderRadius:10, border:`1px solid ${earned?"#f59e0b":"#334155"}`,
                background: earned?"#1c1505":"#0f172a", opacity: earned?1:0.5, transition:"all 0.3s",
              }}>
                <div style={{ fontSize:28, marginBottom:4 }}>{badge.icon}</div>
                <div style={{ fontWeight:800, fontSize:14 }}>{badge.name}</div>
                <div style={{ color:"#94a3b8", fontSize:12 }}>{badge.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <button className="btn btn-danger" onClick={() => {
        if (window.confirm("Reset all progress? This can't be undone.")) {
          setProfile({ ...defaultProfile, name: profile.name, avatar: profile.avatar, state: profile.state });
        }
      }}>🗑 Reset Progress</button>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("driveready_profile");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [tab, setTab] = useState("home");
  const [lesson, setLesson] = useState(null); // {topic, lesson}
  const [appData, setAppData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [badgeQueue, setBadgeQueue] = useState([]);

  function updateProfile(updater) {
    setProfile(prev => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      const prevBadges = prev?.badges || [];
      const nextBadges = next?.badges || [];
      const newOnes = nextBadges.filter(b => !prevBadges.includes(b));
      if (newOnes.length > 0) setBadgeQueue(q => [...q, ...newOnes]);
      return next;
    });
  }

  // Load topics, badges, levels from Supabase (or local fallback)
  useEffect(() => {
    async function loadAppData() {
      if (!supabase) {
        setAppData({ topics: TOPICS_FALLBACK, badges: BADGES_FALLBACK, levels: LEVELS_FALLBACK });
        setDataLoading(false);
        return;
      }
      const [topicsRes, lessonsRes, badgesRes, levelsRes] = await Promise.all([
        supabase.from("topics").select("*").order("sort_order"),
        supabase.from("lessons").select("*").order("sort_order"),
        supabase.from("badges").select("*").order("sort_order"),
        supabase.from("levels").select("*").order("sort_order"),
      ]);
      if (topicsRes.error || lessonsRes.error || badgesRes.error || levelsRes.error) {
        setAppData({ topics: TOPICS_FALLBACK, badges: BADGES_FALLBACK, levels: LEVELS_FALLBACK });
      } else {
        const topics = topicsRes.data.map(t => ({
          ...t,
          lessons: lessonsRes.data
            .filter(l => l.topic_id === t.id)
            .map(l => ({ id: l.id, title: l.title, content: l.content })),
        }));
        const levels = levelsRes.data.map(l => ({ ...l, min: l.min_xp }));
        setAppData({ topics, badges: badgesRes.data, levels });
      }
      setDataLoading(false);
    }
    loadAppData();
  }, []);

  // Save profile
  useEffect(() => {
    if (profile) {
      try { localStorage.setItem("driveready_profile", JSON.stringify(profile)); } catch {}
    }
  }, [profile]);

  // Streak logic
  useEffect(() => {
    if (!profile) return;
    const today = new Date().toDateString();
    if (profile.lastStudy === today) return;
    const yesterday = new Date(Date.now()-86400000).toDateString();
    if (profile.lastStudy === yesterday) {
      const newStreak = (profile.streak||0) + 1;
      let newBadges = [...(profile.badges||[])];
      let newStreakFreeze = profile.streakFreeze ?? 0;
      if (newStreak >= 3 && !newBadges.includes("streak_3")) newBadges.push("streak_3");
      if (newStreak >= 7 && !newBadges.includes("week_warrior")) newBadges.push("week_warrior");
      if (newStreak % 7 === 0 && newStreakFreeze === 0) newStreakFreeze = 1;
      updateProfile(p => ({ ...p, streak: newStreak, lastStudy: today, badges: newBadges, streakFreeze: newStreakFreeze,
        bestStreak: Math.max(newStreak, p.bestStreak || 0) }));
    } else if ((profile.streakFreeze ?? 0) > 0) {
      updateProfile(p => ({ ...p, streakFreeze: (p.streakFreeze||1) - 1, lastStudy: today }));
    } else {
      updateProfile(p => ({ ...p, streak: 1, lastStudy: today }));
    }
  }, []);

  if (dataLoading) {
    return (
      <>
        <style>{css}</style>
        <div className="app" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", flexDirection:"column", gap:16 }}>
          <div style={{ fontSize:64 }}>🚗</div>
          <p style={{ fontFamily:"Fredoka One", fontSize:28, color:"#f59e0b" }}>DriveReady</p>
          <p style={{ color:"#94a3b8" }}>Loading...</p>
        </div>
      </>
    );
  }

  const { topics, badges, levels } = appData;

  if (!profile) {
    return (
      <>
        <style>{css}</style>
        <div className="app">
          <OnboardingScreen onComplete={p => updateProfile({ ...defaultProfile, ...p, lastStudy: new Date().toDateString(), streak:1 })}/>
        </div>
      </>
    );
  }

  if (lesson) {
    return (
      <>
        <style>{css}</style>
        {badgeQueue.length > 0 && (
          <BadgeUnlockOverlay badgeId={badgeQueue[0]} badges={badges}
            onDismiss={() => setBadgeQueue(q => q.slice(1))}/>
        )}
        <div className="app">
          <LessonScreen topic={lesson.topic} lesson={lesson.lesson}
            profile={profile} setProfile={updateProfile}
            onBack={() => setLesson(null)}/>
        </div>
      </>
    );
  }

  const TABS = [
    { id:"home", icon:"🏠", label:"Home" },
    { id:"learn", icon:"📚", label:"Learn" },
    { id:"quiz", icon:"🎯", label:"Quiz" },
    { id:"profile", icon:"👤", label:"Profile" },
  ];

  return (
    <>
      <style>{css}</style>
      {badgeQueue.length > 0 && (
        <BadgeUnlockOverlay badgeId={badgeQueue[0]} badges={badges}
          onDismiss={() => setBadgeQueue(q => q.slice(1))}/>
      )}
      <div className="app">
        {tab==="home" && <DashboardScreen profile={profile} setProfile={updateProfile} topics={topics} levels={levels}/>}
        {tab==="learn" && <LearnScreen profile={profile} setProfile={updateProfile} topics={topics}
          onStartLesson={(topic,lesson) => setLesson({topic,lesson})}/>}
        {tab==="quiz" && <QuizScreen profile={profile} setProfile={updateProfile} topics={topics}/>}
        {tab==="profile" && <ProfileScreen profile={profile} setProfile={updateProfile} badges={badges} levels={levels} topics={topics}/>}

        <nav className="nav">
          {TABS.map(t => (
            <button key={t.id} className={`nav-btn${tab===t.id?" active":""}`}
              onClick={() => setTab(t.id)}>
              <span className="icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
