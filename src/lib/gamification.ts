/**
 * Gamification constants and helpers
 */

export const LEVEL_CONFIG = [
  { level: 1, name: "Newcomer", minXP: 0, color: "hsl(215, 30%, 55%)", icon: "🌱" },
  { level: 2, name: "Contributor", minXP: 200, color: "hsl(160, 50%, 42%)", icon: "⚡" },
  { level: 3, name: "Expert", minXP: 800, color: "hsl(215, 70%, 50%)", icon: "🔥" },
  { level: 4, name: "Thought Leader", minXP: 2000, color: "hsl(268, 55%, 52%)", icon: "💎" },
  { level: 5, name: "Legend", minXP: 5000, color: "hsl(42, 75%, 50%)", icon: "👑" },
] as const;

export function getLevelConfig(level: number) {
  return LEVEL_CONFIG[Math.min(level - 1, LEVEL_CONFIG.length - 1)] || LEVEL_CONFIG[0];
}

export function getNextLevelConfig(level: number) {
  if (level >= LEVEL_CONFIG.length) return null;
  return LEVEL_CONFIG[level];
}

export function getXPProgress(totalXP: number, level: number) {
  const current = getLevelConfig(level);
  const next = getNextLevelConfig(level);
  if (!next) return 100; // max level
  const range = next.minXP - current.minXP;
  const progress = totalXP - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
}

export const TIER_COLORS: Record<string, string> = {
  bronze: "hsl(30, 50%, 50%)",
  silver: "hsl(220, 10%, 65%)",
  gold: "hsl(46, 65%, 52%)",
  platinum: "hsl(270, 50%, 55%)",
};

export const BADGE_CATEGORY_LABELS: Record<string, string> = {
  content: "Content",
  network: "Network",
  engagement: "Engagement",
  streak: "Streaks",
  trust: "Trust",
  events: "Events",
  opinions: "Opinions",
  milestone: "Milestones",
};
