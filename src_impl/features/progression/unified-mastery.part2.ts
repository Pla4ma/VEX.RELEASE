import { z } from "zod";


export function calculateBossMasteryXp(bossDefeated: boolean, bossHealthPercent: number, damageDealt: number, fightDuration: number, criticalHits: number): number {
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
  },
): SessionMasteryResult {
  const byTrack: Record<MasteryTrack, number> = {
    DURATION: calculateDurationMasteryXp(sessionData.duration, sessionData.wasInterrupted, sessionData.purityScore),
    PURITY: calculatePurityMasteryXp(sessionData.purityScore, sessionData.duration, sessionData.pauseCount),
    CONSISTENCY: calculateConsistencyMasteryXp(sessionData.streakDays, sessionData.sessionsToday, sessionData.daysActiveThisWeek),
    COMEBACK: calculateComebackMasteryXp(sessionData.isComeback, sessionData.daysSinceLastSession, sessionData.previousStreak),
    BOSS: calculateBossMasteryXp(sessionData.bossDefeated, sessionData.bossHealthPercent, sessionData.damageDealt, sessionData.fightDuration, sessionData.criticalHits),
  };

  const totalXp = Object.values(byTrack).reduce((a, b) => a + b, 0);

  return {
    totalXp,
    byTrack,
    levelUps: [], // Populated after applying XP
    overallLevelUp: false,
  };
}

export function applyMasteryXp(state: UnifiedMasteryState, xpByTrack: Record<MasteryTrack, number>): ApplyXpResult {
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
  newState.overallLevel = Math.floor(trackLevels.reduce((a, b) => a + b, 0) / MASTERY_TRACKS.length);

  // Update rank
  newState.overallRank = calculateMasteryRank(newState.overallLevel, newState.prestigeLevel);

  const overallLevelUp =
    newState.overallLevel > oldOverallLevel
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