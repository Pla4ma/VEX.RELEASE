import type { UnifiedMasteryState, MasteryRank } from '../unified-mastery';

const DEFAULT_RANK: MasteryRank = 'APPRENTICE';

function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function createStarterMasteryState(userId: string): UnifiedMasteryState {
  const now = Date.now();
  const starterTrack = {
    level: 1,
    xp: 0,
    xpToNext: calculateXpForLevel(2),
    totalXp: 0,
    milestonesCompleted: [],
  };
  return {
    userId,
    tracks: {
      DURATION: { ...starterTrack },
      PURITY: { ...starterTrack },
      CONSISTENCY: { ...starterTrack },
      COMEBACK: { ...starterTrack },
      BOSS: { ...starterTrack },
    },
    overallLevel: 1,
    overallRank: DEFAULT_RANK,
    prestigeLevel: 0,
    prestigeBonuses: [],
    lastUpdated: now,
    createdAt: now,
  };
}
