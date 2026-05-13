import { z } from "zod";


export function checkUnlocks(state: UnifiedMasteryState, existingUnlocks: string[]): { newlyUnlocked: MasteryUnlock[]; allUnlocks: string[] } {
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
  },
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