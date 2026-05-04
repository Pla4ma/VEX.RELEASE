/**
 * Unified Mastery System - VEX 10/10 Transformation
 *
 * Consolidates Level + Mastery into single progression:
 * - 5 technique tracks (Duration, Purity, Consistency, Comeback, Boss)
 * - Each track has 50 levels
 * - Overall "Focus Mastery" is average of all tracks
 * - Unlocks gated by specific track levels
 * - Removes arbitrary XP grind in favor of skill expression
 *
 * @phase 2A - Progression Consolidation
 */

import { z } from 'zod';

// ============================================================================
// Core Types
// ============================================================================

export const MasteryTrackSchema = z.enum([
  'DURATION',
  'PURITY',
  'CONSISTENCY',
  'COMEBACK',
  'BOSS',
]);

export type MasteryTrack = z.infer<typeof MasteryTrackSchema>;

export const MASTERY_TRACKS: MasteryTrack[] = [
  'DURATION',
  'PURITY',
  'CONSISTENCY',
  'COMEBACK',
  'BOSS',
];

export interface MasteryTrackState {
  level: number; // 1-50
  xp: number; // Current XP in level
  xpToNext: number; // XP needed for next level
  totalXp: number; // Lifetime XP in this track
  milestonesCompleted: number[]; // Which milestone levels achieved
}

export interface UnifiedMasteryState {
  userId: string;

  // Individual tracks
  tracks: Record<MasteryTrack, MasteryTrackState>;

  // Overall mastery (calculated from tracks)
  overallLevel: number; // 1-50 (average of tracks)
  overallRank: MasteryRank;

  // Prestige info
  prestigeLevel: number; // 0 = never prestiged
  prestigeBonuses: string[]; // Active permanent bonuses

  // Meta
  lastUpdated: number;
  createdAt: number;
}

export type MasteryRank =
  | 'APPRENTICE'    // Overall 1-10
  | 'ADEPT'         // 11-20
  | 'EXPERT'        // 21-30
  | 'MASTER'        // 31-40
  | 'GRANDMASTER'   // 41-50
  | 'TRANSCENDENT'; // Prestiged

// ============================================================================
// Rank Configuration
// ============================================================================

export const RANK_CONFIG: Record<MasteryRank, {
  minLevel: number;
  maxLevel: number;
  displayName: string;
  color: string;
  icon: string;
  unlocks: string[];
}> = {
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

// ============================================================================
// XP Calculation Formulas
// ============================================================================

export function calculateXpForLevel(level: number): number {
  // Exponential curve: harder to level up as you progress
  // Level 1: 100 XP
  // Level 10: 500 XP
  // Level 25: 2000 XP
  // Level 50: 10000 XP
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export interface SessionMasteryXp {
  track: MasteryTrack;
  xpEarned: number;
  reason: string;
}

export function calculateDurationMasteryXp(
  sessionMinutes: number,
  wasInterrupted: boolean,
  purityScore: number
): number {
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

export function calculatePurityMasteryXp(
  purityScore: number,
  sessionMinutes: number,
  pauseCount: number
): number {
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

export function calculateConsistencyMasteryXp(
  streakDays: number,
  sessionsToday: number,
  daysActiveThisWeek: number
): number {
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

export function calculateComebackMasteryXp(
  isComeback: boolean,
  daysSinceLastSession: number,
  previousStreak: number
): number {
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

export function calculateBossMasteryXp(
  bossDefeated: boolean,
  bossHealthPercent: number,
  damageDealt: number,
  fightDuration: number,
  criticalHits: number
): number {
  if (!bossDefeated) {
    return Math.floor(damageDealt / 100); // Small XP for effort
  }

  let xp = 100; // Base defeat XP

  // Speed bonus (defeating boss faster)
  const speedBonus = Math.floor((1 - bossHealthPercent) * 50);
  xp += speedBonus;

  // Critical hit bonus
  xp += criticalHits * 15;

  // First-try bonus (if fight duration is short relative to health)
  if (fightDuration < 60 && bossHealthPercent < 0.5) {
    xp += 50;
  }

  return xp;
}

// ============================================================================
// XP Distribution from Single Session
// ============================================================================

export interface SessionMasteryResult {
  totalXp: number;
  byTrack: Record<MasteryTrack, number>;
  levelUps: Array<{ track: MasteryTrack; newLevel: number }>;
  overallLevelUp: boolean;
}

export function calculateMasteryXpFromSession(
  state: UnifiedMasteryState,
  sessionData: {
    duration: number;
    purityScore: number;
    pauseCount: number;
    wasInterrupted: boolean;
    streakDays: number;
    sessionsToday: number;
    daysActiveThisWeek: number;
    isComeback: boolean;
    daysSinceLastSession: number;
    previousStreak: number;
    bossDefeated: boolean;
    bossHealthPercent: number;
    damageDealt: number;
    fightDuration: number;
    criticalHits: number;
  }
): SessionMasteryResult {
  const byTrack: Record<MasteryTrack, number> = {
    DURATION: calculateDurationMasteryXp(
      sessionData.duration,
      sessionData.wasInterrupted,
      sessionData.purityScore
    ),
    PURITY: calculatePurityMasteryXp(
      sessionData.purityScore,
      sessionData.duration,
      sessionData.pauseCount
    ),
    CONSISTENCY: calculateConsistencyMasteryXp(
      sessionData.streakDays,
      sessionData.sessionsToday,
      sessionData.daysActiveThisWeek
    ),
    COMEBACK: calculateComebackMasteryXp(
      sessionData.isComeback,
      sessionData.daysSinceLastSession,
      sessionData.previousStreak
    ),
    BOSS: calculateBossMasteryXp(
      sessionData.bossDefeated,
      sessionData.bossHealthPercent,
      sessionData.damageDealt,
      sessionData.fightDuration,
      sessionData.criticalHits
    ),
  };

  const totalXp = Object.values(byTrack).reduce((a, b) => a + b, 0);

  return {
    totalXp,
    byTrack,
    levelUps: [], // Populated after applying XP
    overallLevelUp: false,
  };
}

// ============================================================================
// Level Management
// ============================================================================

export interface ApplyXpResult {
  newState: UnifiedMasteryState;
  levelUps: Array<{ track: MasteryTrack; oldLevel: number; newLevel: number }>;
  overallLevelUp: { oldLevel: number; newLevel: number; newRank: MasteryRank } | null;
}

export function applyMasteryXp(
  state: UnifiedMasteryState,
  xpByTrack: Record<MasteryTrack, number>
): ApplyXpResult {
  const newState: UnifiedMasteryState = JSON.parse(JSON.stringify(state));
  const levelUps: Array<{ track: MasteryTrack; oldLevel: number; newLevel: number }> = [];

  // Apply XP to each track
  for (const track of MASTERY_TRACKS) {
    const xp = xpByTrack[track];
    if (xp <= 0) {
      continue;
    }

    const trackState = newState.tracks[track];
    const oldLevel = trackState.level;

    trackState.xp += xp;
    trackState.totalXp += xp;

    // Check for level up
    while (trackState.xp >= trackState.xpToNext && trackState.level < 50) {
      trackState.xp -= trackState.xpToNext;
      trackState.level++;
      trackState.xpToNext = calculateXpForLevel(trackState.level);
      trackState.milestonesCompleted.push(trackState.level);
    }

    if (trackState.level > oldLevel) {
      levelUps.push({ track, oldLevel, newLevel: trackState.level });
    }
  }

  // Recalculate overall level
  const oldOverallLevel = newState.overallLevel;
  const trackLevels = MASTERY_TRACKS.map((t) => newState.tracks[t].level);
  newState.overallLevel = Math.floor(
    trackLevels.reduce((a, b) => a + b, 0) / MASTERY_TRACKS.length
  );

  // Update rank
  newState.overallRank = calculateMasteryRank(newState.overallLevel, newState.prestigeLevel);

  const overallLevelUp = newState.overallLevel > oldOverallLevel
    ? {
        oldLevel: oldOverallLevel,
        newLevel: newState.overallLevel,
        newRank: newState.overallRank,
      }
    : null;

  newState.lastUpdated = Date.now();

  return { newState, levelUps, overallLevelUp };
}

export function calculateMasteryRank(overallLevel: number, prestigeLevel: number): MasteryRank {
  if (prestigeLevel > 0) {
    return 'TRANSCENDENT';
  }
  if (overallLevel >= 41) {
    return 'GRANDMASTER';
  }
  if (overallLevel >= 31) {
    return 'MASTER';
  }
  if (overallLevel >= 21) {
    return 'EXPERT';
  }
  if (overallLevel >= 11) {
    return 'ADEPT';
  }
  return 'APPRENTICE';
}

// ============================================================================
// Unlock System
// ============================================================================

export interface MasteryUnlock {
  id: string;
  name: string;
  description: string;
  requiredTrack: MasteryTrack;
  requiredLevel: number;
  unlocked: boolean;
}

export const MASTERY_UNLOCKS: MasteryUnlock[] = [
  // Duration unlocks
  { id: 'mode_sprint', name: 'Sprint Mode', description: 'Fast-paced 25-minute sessions', requiredTrack: 'DURATION', requiredLevel: 5, unlocked: false },
  { id: 'boss_tier2', name: 'Tier 2 Bosses', description: 'Face stronger opponents', requiredTrack: 'DURATION', requiredLevel: 10, unlocked: false },
  { id: 'mode_deep_work', name: 'Deep Work Mode', description: 'Extended 90-minute sessions', requiredTrack: 'DURATION', requiredLevel: 20, unlocked: false },

  // Purity unlocks
  { id: 'perfect_session_bonus', name: 'Perfect Session Bonus', description: 'Extra rewards for 95%+ purity', requiredTrack: 'PURITY', requiredLevel: 5, unlocked: false },
  { id: 'critical_hits', name: 'Critical Hit System', description: 'Land critical strikes on bosses', requiredTrack: 'PURITY', requiredLevel: 15, unlocked: false },
  { id: 'nightmare_bosses', name: 'Nightmare Difficulty', description: 'Ultimate challenge mode', requiredTrack: 'PURITY', requiredLevel: 30, unlocked: false },

  // Consistency unlocks
  { id: 'squad_access', name: 'Squads', description: 'Join or create focus squads', requiredTrack: 'CONSISTENCY', requiredLevel: 10, unlocked: false },
  { id: 'daily_dungeons', name: 'Daily Dungeons', description: 'Special daily challenges', requiredTrack: 'CONSISTENCY', requiredLevel: 15, unlocked: false },
  { id: 'streak_insurance', name: 'Streak Insurance', description: 'Protect your streak with coins', requiredTrack: 'CONSISTENCY', requiredLevel: 20, unlocked: false },

  // Comeback unlocks
  { id: 'comeback_tokens', name: 'Comeback Tokens', description: 'Earn tokens from broken streaks', requiredTrack: 'COMEBACK', requiredLevel: 5, unlocked: false },
  { id: 'rivals', name: 'Rival System', description: 'Compete with matched opponents', requiredTrack: 'COMEBACK', requiredLevel: 15, unlocked: false },
  { id: 'phoenix_mode', name: 'Phoenix Mode', description: '2x XP for 7 days after comeback', requiredTrack: 'COMEBACK', requiredLevel: 25, unlocked: false },

  // Boss unlocks
  { id: 'boss_crafting', name: 'Boss Essence Crafting', description: 'Craft items from defeated bosses', requiredTrack: 'BOSS', requiredLevel: 10, unlocked: false },
  { id: 'squad_raids', name: 'Squad Raids', description: 'Coordinated boss battles', requiredTrack: 'BOSS', requiredLevel: 20, unlocked: false },
  { id: 'transcendence', name: 'Transcendence', description: 'Prestige and start anew stronger', requiredTrack: 'BOSS', requiredLevel: 40, unlocked: false },
];

export function checkUnlocks(
  state: UnifiedMasteryState,
  existingUnlocks: string[]
): { newlyUnlocked: MasteryUnlock[]; allUnlocks: string[] } {
  const newlyUnlocked: MasteryUnlock[] = [];
  const allUnlocks = [...existingUnlocks];

  for (const unlock of MASTERY_UNLOCKS) {
    const trackLevel = state.tracks[unlock.requiredTrack].level;
    const alreadyUnlocked = existingUnlocks.includes(unlock.id);

    if (trackLevel >= unlock.requiredLevel && !alreadyUnlocked) {
      newlyUnlocked.push({ ...unlock, unlocked: true });
      allUnlocks.push(unlock.id);
    }
  }

  return { newlyUnlocked, allUnlocks };
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createInitialMasteryState(userId: string): UnifiedMasteryState {
  const tracks: Record<MasteryTrack, MasteryTrackState> = {
    DURATION: { level: 1, xp: 0, xpToNext: calculateXpForLevel(1), totalXp: 0, milestonesCompleted: [] },
    PURITY: { level: 1, xp: 0, xpToNext: calculateXpForLevel(1), totalXp: 0, milestonesCompleted: [] },
    CONSISTENCY: { level: 1, xp: 0, xpToNext: calculateXpForLevel(1), totalXp: 0, milestonesCompleted: [] },
    COMEBACK: { level: 1, xp: 0, xpToNext: calculateXpForLevel(1), totalXp: 0, milestonesCompleted: [] },
    BOSS: { level: 1, xp: 0, xpToNext: calculateXpForLevel(1), totalXp: 0, milestonesCompleted: [] },
  };

  return {
    userId,
    tracks,
    overallLevel: 1,
    overallRank: 'APPRENTICE',
    prestigeLevel: 0,
    prestigeBonuses: [],
    lastUpdated: Date.now(),
    createdAt: Date.now(),
  };
}

// ============================================================================
// Migration from Old System
// ============================================================================

export function migrateFromLegacyProgression(
  userId: string,
  oldLevel: number,
  oldXp: number,
  masteryData?: {
    durationMastery?: number;
    purityMastery?: number;
    consistencyMastery?: number;
    comebackMastery?: number;
    bossMastery?: number;
  }
): UnifiedMasteryState {
  const state = createInitialMasteryState(userId);

  // Distribute old XP across tracks
  const xpPerTrack = Math.floor(oldXp / 5);

  for (const track of MASTERY_TRACKS) {
    const trackKey = `${track.toLowerCase()}_mastery` as keyof typeof masteryData;
    const bonusXp = masteryData?.[trackKey] || 0;

    const result = applyMasteryXp(state, {
      ...{ DURATION: 0, PURITY: 0, CONSISTENCY: 0, COMEBACK: 0, BOSS: 0 },
      [track]: xpPerTrack + bonusXp,
    } as Record<MasteryTrack, number>);

    state.tracks[track] = result.newState.tracks[track];
  }

  // Recalculate overall
  const trackLevels = MASTERY_TRACKS.map((t) => state.tracks[t].level);
  state.overallLevel = Math.floor(trackLevels.reduce((a, b) => a + b, 0) / MASTERY_TRACKS.length);
  state.overallRank = calculateMasteryRank(state.overallLevel, 0);

  return state;
}
