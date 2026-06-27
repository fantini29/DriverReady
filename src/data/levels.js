// Local fallback — used only when Supabase is unreachable.
// Source of truth is Supabase: levels table.

export const LEVELS = [
  { name: "Learner",        min: 0,    color: "#94a3b8" },
  { name: "Permit Holder",  min: 200,  color: "#60a5fa" },
  { name: "Student Driver", min: 500,  color: "#34d399" },
  { name: "Road Ready",     min: 1000, color: "#f59e0b" },
  { name: "Licensed",       min: 2000, color: "#f97316" },
];
