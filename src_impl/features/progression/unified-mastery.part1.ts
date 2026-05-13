import { z } from "zod";


export const MasteryTrackSchema = z.enum(['DURATION', 'PURITY', 'CONSISTENCY', 'COMEBACK', 'BOSS']);

export const MASTERY_TRACKS: MasteryTrack[] = ['DURATION', 'PURITY', 'CONSISTENCY', 'COMEBACK', 'BOSS'];

export const RANK_CONFIG: Record<
  MasteryRank,
  {
    minLevel: number;
    maxLevel: number;
    displayName: string;
    color: string;
    icon: string;
    unlocks: string[];
  }
> = {
  APPRENTICE: {
    minLevel: 1,
    maxLevel: 10,
    displayName: 'Apprentice',
    color: '#8B4513',
    icon: '🌱',
    unlocks: ['Basic bosses', 'Light Focus mode'],
  },
  ADEPT: {
    minLevel: 11,
    maxLevel: 20,
    displayName: 'Adept',
    color: '#4A5568',
    icon: '⚔️',
    unlocks: ['Sprint mode', 'Study mode', 'Advanced challenges'],
  },
  EXPERT: {
    minLevel: 21,
    maxLevel: 30,
    displayName: 'Expert',
    color: '#4169E1',
    icon: '🛡️',
    unlocks: ['Deep Work mode', 'Creative mode', 'Squad access', 'Daily dungeons'],
  },
  MASTER: {
    minLevel: 31,
    maxLevel: 40,
    displayName: 'Master',
    color: '#9400D3',
    icon: '👑',
    unlocks: ['Nightmare bosses', 'Rival system', 'Item crafting'],
  },
  GRANDMASTER: {
    minLevel: 41,
    maxLevel: 50,
    displayName: 'Grandmaster',
    color: '#FFD700',
    icon: '⭐',
    unlocks: ['Transcendence (Prestige)', 'Legendary items', 'Guild Wars'],
  },
  TRANSCENDENT: {
    minLevel: 51,
    maxLevel: 999,
    displayName: 'Transcendent',
    color: '#FF00FF',
    icon: '✨',
    unlocks: ['All previous + prestige bonuses'],
  },
};

export function calculateXpForLevel(level: number): number {
  // Exponential curve: harder to level up as you progress
  // Level 1: 100 XP
  // Level 10: 500 XP
  // Level 25: 2000 XP
  // Level 50: 10000 XP
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function calculateDurationMasteryXp(sessionMinutes: number, wasInterrupted: boolean, purityScore: number): number {
  if (wasInterrupted) {
    return 0;
  }

  // Base XP from duration
  let xp = Math.floor(sessionMinutes * 0.5);

  // Purity bonus (up to 2x)
  const purityMultiplier = 0.5 + (purityScore / 100) * 1.5;
  xp = Math.floor(xp * purityMultiplier);

  // Milestone bonuses
  if (sessionMinutes >= 90) {
    xp += 50; // Marathon bonus
  }
  if (sessionMinutes >= 60 && purityScore >= 90) {
    xp += 30; // Deep focus bonus
  }

  return xp;
}

export function calculatePurityMasteryXp(purityScore: number, sessionMinutes: number, pauseCount: number): number {
  // Only gain XP if purity is decent
  if (purityScore < 70) {
    return 0;
  }

  let xp = Math.floor(purityScore / 5);

  // No-pause bonus
  if (pauseCount === 0) {
    xp *= 2;
  }

  // Duration threshold
  if (sessionMinutes >= 45) {
    xp += 20;
  }

  // Perfect session (95%+)
  if (purityScore >= 95) {
    xp += 50;
  }

  return xp;
}

export function calculateConsistencyMasteryXp(streakDays: number, sessionsToday: number, daysActiveThisWeek: number): number {
  let xp = 10; // Base daily XP

  // Streak bonus (up to 3x)
  const streakMultiplier = Math.min(3, 1 + streakDays * 0.05);
  xp = Math.floor(xp * streakMultiplier);

  // Multiple sessions per day bonus
  if (sessionsToday >= 2) {
    xp += 15;
  }
  if (sessionsToday >= 3) {
    xp += 25;
  }

  // Weekly consistency
  if (daysActiveThisWeek >= 5) {
    xp += 20;
  }

  return xp;
}

export function calculateComebackMasteryXp(isComeback: boolean, daysSinceLastSession: number, previousStreak: number): number {
  if (!isComeback) {
    return 0;
  }

  let xp = 25; // Base comeback XP

  // Faster recovery = more XP
  if (daysSinceLastSession === 1) {
    xp += 50; // Next-day recovery bonus
  } else if (daysSinceLastSession <= 3) {
    xp += 25;
  }

  // Higher previous streak = bigger comeback
  if (previousStreak >= 30) {
    xp += 50;
  } else if (previousStreak >= 14) {
    xp += 30;
  }

  return xp;
}