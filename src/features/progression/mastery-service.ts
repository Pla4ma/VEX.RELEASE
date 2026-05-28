import type {
  ApplyXpResult,
  MasteryTrack,
  MasteryTrackState,
  SessionMasteryResult,
  UnifiedMasteryState,
} from "./mastery-types";
import {
  calculateMasteryRank,
  calculateXpForLevel,
  MASTERY_TRACKS,
} from "./mastery-types";
import {
  calculateBossMasteryXp,
  calculateComebackMasteryXp,
  calculateConsistencyMasteryXp,
  calculateDurationMasteryXp,
  calculatePurityMasteryXp,
} from "./xp-calculators";

interface LegacyMasteryData {
  durationMastery?: number;
  purityMastery?: number;
  consistencyMastery?: number;
  comebackMastery?: number;
  bossMastery?: number;
}

const TRACK_TO_LEGACY_KEY: Record<MasteryTrack, keyof LegacyMasteryData> = {
  DURATION: "durationMastery",
  PURITY: "purityMastery",
  CONSISTENCY: "consistencyMastery",
  COMEBACK: "comebackMastery",
  BOSS: "bossMastery",
};

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
    DURATION: calculateDurationMasteryXp(
      sessionData.duration,
      sessionData.wasInterrupted,
      sessionData.purityScore,
    ),
    PURITY: calculatePurityMasteryXp(
      sessionData.purityScore,
      sessionData.duration,
      sessionData.pauseCount,
    ),
    CONSISTENCY: calculateConsistencyMasteryXp(
      sessionData.streakDays,
      sessionData.sessionsToday,
      sessionData.daysActiveThisWeek,
    ),
    COMEBACK: calculateComebackMasteryXp(
      sessionData.isComeback,
      sessionData.daysSinceLastSession,
      sessionData.previousStreak,
    ),
    BOSS: calculateBossMasteryXp(
      sessionData.bossDefeated,
      sessionData.bossHealthPercent,
      sessionData.damageDealt,
      sessionData.fightDuration,
      sessionData.criticalHits,
    ),
  };
  const totalXp = Object.values(byTrack).reduce((a, b) => a + b, 0);
  return { totalXp, byTrack, levelUps: [], overallLevelUp: false };
}

export function applyMasteryXp(
  state: UnifiedMasteryState,
  xpByTrack: Record<MasteryTrack, number>,
): ApplyXpResult {
  const newState: UnifiedMasteryState = JSON.parse(JSON.stringify(state));
  const levelUps: Array<{
    track: MasteryTrack;
    oldLevel: number;
    newLevel: number;
  }> = [];
  for (const track of MASTERY_TRACKS) {
    const xp = xpByTrack[track];
    if (xp <= 0) {
      continue;
    }
    const trackState = newState.tracks[track];
    const oldLevel = trackState.level;
    trackState.xp += xp;
    trackState.totalXp += xp;
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
  const oldOverallLevel = newState.overallLevel;
  const trackLevels = MASTERY_TRACKS.map((t) => newState.tracks[t].level);
  newState.overallLevel = Math.floor(
    trackLevels.reduce((a, b) => a + b, 0) / MASTERY_TRACKS.length,
  );
  newState.overallRank = calculateMasteryRank(
    newState.overallLevel,
    newState.prestigeLevel,
  );
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

function createTrackState(): MasteryTrackState {
  return {
    level: 1,
    xp: 0,
    xpToNext: calculateXpForLevel(1),
    totalXp: 0,
    milestonesCompleted: [],
  };
}

export function createInitialMasteryState(
  userId: string,
): UnifiedMasteryState {
  const tracks: Record<MasteryTrack, MasteryTrackState> = {
    DURATION: createTrackState(),
    PURITY: createTrackState(),
    CONSISTENCY: createTrackState(),
    COMEBACK: createTrackState(),
    BOSS: createTrackState(),
  };
  return {
    userId,
    tracks,
    overallLevel: 1,
    overallRank: "APPRENTICE",
    prestigeLevel: 0,
    prestigeBonuses: [],
    lastUpdated: Date.now(),
    createdAt: Date.now(),
  };
}

export function migrateFromLegacyProgression(
  userId: string,
  oldLevel: number,
  oldXp: number,
  masteryData?: LegacyMasteryData,
): UnifiedMasteryState {
  const state = createInitialMasteryState(userId);
  const xpPerTrack = Math.floor(oldXp / 5);
  for (const track of MASTERY_TRACKS) {
    const trackKey = TRACK_TO_LEGACY_KEY[track];
    const bonusXp = masteryData?.[trackKey] ?? 0;
    const xpByTrack: Record<MasteryTrack, number> = {
      DURATION: 0,
      PURITY: 0,
      CONSISTENCY: 0,
      COMEBACK: 0,
      BOSS: 0,
    };
    xpByTrack[track] = xpPerTrack + bonusXp;
    const result = applyMasteryXp(state, xpByTrack);
    state.tracks[track] = result.newState.tracks[track];
  }
  const trackLevels = MASTERY_TRACKS.map((t) => state.tracks[t].level);
  state.overallLevel = Math.floor(
    trackLevels.reduce((a, b) => a + b, 0) / MASTERY_TRACKS.length,
  );
  state.overallRank = calculateMasteryRank(state.overallLevel, 0);
  return state;
}
