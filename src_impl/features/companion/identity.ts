/**
 * Identity Formation System
 *
 * Makes users feel "I am a focused person" by tracking patterns
 * and reflecting them back as identity statements.
 *
 * Identity mechanics:
 * - Pattern tracking: when you focus, time of day, duration preferences
 * - Identity reflection: "You've focused 50 hours. You're someone who shows up."
 * - Weekly identity summary: "This week, you were focused for 3 hours."
 * - Milestone identity shifts: "At 100 sessions, you're not just trying — you're committed."
 */

import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';

// ── Types ────────────────────────────────────────────────────────────────────
// ── Identity Levels ──────────────────────────────────────────────────────────

const IDENTITY_THRESHOLDS: Array<{ level: IdentityLevel; minSessions: number; minMinutes: number }> = [
  { level: 'newcomer', minSessions: 0, minMinutes: 0 },
  { level: 'building', minSessions: 5, minMinutes: 60 },
  { level: 'consistent', minSessions: 20, minMinutes: 300 },
  { level: 'dedicated', minSessions: 50, minMinutes: 1000 },
  { level: 'committed', minSessions: 100, minMinutes: 2500 },
  { level: 'mastered', minSessions: 200, minMinutes: 5000 },
];

const IDENTITY_LABELS: Record<IdentityLevel, string> = {
  newcomer: 'New Explorer',
  building: 'Building Momentum',
  consistent: 'Consistent Focuser',
  dedicated: 'Dedicated Achiever',
  committed: 'Committed Master',
  mastered: 'Focus Veteran',
};

const IDENTITY_SHIFT_MESSAGES: Record<IdentityLevel, string> = {
  newcomer: 'Welcome. Your journey starts now.',
  building: "You're building something. Keep going.",
  consistent: "You've become consistent. That's rare. Most people quit by now.",
  dedicated: "You're not just trying anymore. You're dedicated.",
  committed: "100 sessions. You're committed. This is who you are now.",
  mastered: "You've mastered the art of showing up. That's extraordinary.",
};

// ── Storage ──────────────────────────────────────────────────────────────────

function profileKey(userId: string): string {
  return `identity_profile_${userId}`;
}

async function saveIdentity(userId: string, profile: IdentityProfile): Promise<void> {
  const storage = getDefaultStorageAdapter();
  await storage.setItem(profileKey(userId), JSON.stringify(profile));
}

// ── Identity Updates ─────────────────────────────────────────────────────────
// ── Identity Queries ─────────────────────────────────────────────────────────
// ── Helpers ──────────────────────────────────────────────────────────────────

function calculateIdentityLevel(profile: IdentityProfile): IdentityLevel {
  let level: IdentityLevel = 'newcomer';
  for (const threshold of IDENTITY_THRESHOLDS) {
    if (profile.totalSessions >= threshold.minSessions && profile.totalFocusMinutes >= threshold.minMinutes) {
      level = threshold.level;
    }
  }
  return level;
}

function generatePatternReflection(profile: IdentityProfile): string {
  const hours = Math.floor(profile.totalFocusMinutes / 60);
  if (profile.favoriteTimeOfDay) {
    return `You've focused ${hours} hours total. You tend to focus best in the ${profile.favoriteTimeOfDay}. That's your natural rhythm.`;
  }
  return `You've focused ${hours} hours across ${profile.totalSessions} sessions. You're building something real.`;
}

function generateWeeklyReflection(profile: IdentityProfile): string {
  const weeklyHours = Math.floor(profile.weeklyMinutes / 60);
  if (profile.weeklyMinutes >= 180) {
    return `This week: ${weeklyHours} hours of focus. You're in a strong rhythm.`;
  }
  if (profile.weeklyMinutes >= 60) {
    return `This week: ${weeklyHours} hours of focus. Solid progress.`;
  }
  return `This week: ${profile.weeklyMinutes} minutes of focus. Every minute counts.`;
}

function getStreakMilestoneMessage(days: number): string {
  if (days >= 365) {return "A full year of daily focus. You've transformed who you are.";}
  if (days >= 100) {return "100 days. You're not just consistent — you're unstoppable.";}
  if (days >= 60) {return "60 days. This isn't a habit anymore. It's part of who you are.";}
  if (days >= 30) {return "30 days. You've proven you can commit. Now keep going.";}
  if (days >= 14) {return "Two weeks. You're building something real.";}
  if (days >= 7) {return "One week. Most people don't make it this far. You did.";}
  return `${days} days. Keep building.`;
}

function getTimeOfDayLabel(hour: number): string {
  if (hour < 6) {return 'early morning';}
  if (hour < 12) {return 'morning';}
  if (hour < 17) {return 'afternoon';}
  if (hour < 21) {return 'evening';}
  return 'night';
}

function getWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0]!;
}

export * from "./identity.types";
export * from "./identity.part1";
