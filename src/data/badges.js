// Local fallback — used only when Supabase is unreachable.
// Source of truth is Supabase: badges table.

export const BADGES = [
  { id: "first_quiz",   icon: "🎯", name: "First Quiz",    description: "Complete your first quiz" },
  { id: "perfect_run",  icon: "⭐", name: "Perfect Run",   description: "Score 100% on a quiz" },
  { id: "streak_3",     icon: "🔥", name: "On Fire",       description: "3-day study streak" },
  { id: "sign_wizard",  icon: "🪄", name: "Sign Wizard",   description: "Score 100% on a Signs & Signals quiz" },
  { id: "speed_demon",  icon: "⚡", name: "Speed Demon",   description: "Finish a timed quiz with 5+ min left" },
  { id: "mock_pass",    icon: "🏆", name: "Mock Passer",   description: "Pass a full mock test" },
  { id: "lesson_5",     icon: "📚", name: "Scholar",       description: "Complete 5 lessons" },
  { id: "xp_500",       icon: "💎", name: "XP Hoarder",   description: "Earn 500 total XP" },
  { id: "week_warrior", icon: "🗓️", name: "Week Warrior",  description: "7-day study streak" },
  { id: "all_nighter",  icon: "🌙", name: "All-Nighter",   description: "Complete 3 quizzes in one day" },
  { id: "clean_sweep",  icon: "🧹", name: "Clean Sweep",   description: "Pass a quiz in every topic" },
];
