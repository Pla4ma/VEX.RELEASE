import {
  MASTERY_RANK_THRESHOLDS,
  calculateTechniqueXp,
  generateMasteryChallenges,
  type MasteryRank,
  type MasteryState,
} from './types';
import { loadMasteryState, loadStoredMasteryState, persistMasteryState } from './repository';

type TechniqueXpGains = ReturnType<typeof calculateTechniqueXp>;
type StoredMasteryState = MasteryState;
type TechniqueKey = keyof StoredMasteryState['techniques'];

function resolveRank(points: number): MasteryRank {
  if (points >= MASTERY_RANK_THRESHOLDS.GRANDMASTER) return 'GRANDMASTER';
  if (points >= MASTERY_RANK_THRESHOLDS.MASTER) return 'MASTER';
  if (points >= MASTERY_RANK_THRESHOLDS.EXPERT) return 'EXPERT';
  if (points >= MASTERY_RANK_THRESHOLDS.ADEPT) return 'ADEPT';
  return 'APPRENTICE';
}

function hydrateChallenges(state: StoredMasteryState): StoredMasteryState {
  const nextChallenges = state.activeChallenges.filter((challenge) => challenge.status !== 'CLAIMED');
  while (nextChallenges.length < 3) {
    const generated = generateMasteryChallenges(state.techniques, state.rank)
      .filter((challenge) => !nextChallenges.some((item) => item.id === challenge.id));
    if (generated.length === 0) break;
    nextChallenges.push(...generated.slice(0, 3 - nextChallenges.length));
  }
  return { ...state, activeChallenges: nextChallenges.slice(0, 3) };
}

function createDefaultState(userId: string): StoredMasteryState {
  return hydrateChallenges({
    userId,
    totalMasteryPoints: 0,
    rank: 'APPRENTICE',
    techniques: {
      durationMastery: 0,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    },
    activeChallenges: [],
    unlockedFeatures: [],
    updatedAt: Date.now(),
  });
}

function loadState(userId: string): StoredMasteryState {
  return hydrateChallenges(loadStoredMasteryState(userId) ?? createDefaultState(userId));
}

async function loadStateAsync(userId: string): Promise<StoredMasteryState> {
  return hydrateChallenges((await loadMasteryState(userId)) ?? createDefaultState(userId));
}

function updateChallengeProgress(state: StoredMasteryState, xpGains: TechniqueXpGains): StoredMasteryState {
  return {
    ...state,
    activeChallenges: state.activeChallenges.map((challenge) => {
      if (challenge.status !== 'ACTIVE') return challenge;
      const nextCurrent = Math.min(challenge.target, challenge.current + xpGains[challenge.technique]);
      return {
        ...challenge,
        current: nextCurrent,
        status: nextCurrent >= challenge.target ? 'COMPLETED' : challenge.status,
        completedAt: nextCurrent >= challenge.target ? Date.now() : challenge.completedAt,
      };
    }),
  };
}

function updateTechniqueProgress(
  userId: string,
  technique: TechniqueKey,
  delta: number,
  masteryPoints: number,
): void {
  if (delta <= 0 && masteryPoints <= 0) return;
  const currentState = loadState(userId);
  const xpGains: TechniqueXpGains = {
    durationMastery: technique === 'durationMastery' ? delta : 0,
    purityMastery: technique === 'purityMastery' ? delta : 0,
    consistencyMastery: technique === 'consistencyMastery' ? delta : 0,
    comebackMastery: technique === 'comebackMastery' ? delta : 0,
    bossMastery: technique === 'bossMastery' ? delta : 0,
  };
  const totalMasteryPoints = currentState.totalMasteryPoints + Math.max(0, masteryPoints);
  persistMasteryState(hydrateChallenges(updateChallengeProgress({
    ...currentState,
    techniques: {
      ...currentState.techniques,
      [technique]: Math.min(25, currentState.techniques[technique] + delta),
    },
    totalMasteryPoints,
    rank: resolveRank(totalMasteryPoints),
  }, xpGains)));
}

export async function recordSessionMasteryProgress(
  userId: string,
  sessionData: {
    effectiveDuration: number;
    focusQuality: number;
    purityScore: number;
    streak: number;
    hasBossActive: boolean;
  },
): Promise<void> {
  const sessionMinutes = Math.floor(sessionData.effectiveDuration / 60000);
  const qualityBonus = sessionData.focusQuality >= 90 ? 1 : 0;
  updateTechniqueProgress(userId, 'durationMastery', sessionMinutes > 45 ? 1 : 0, sessionMinutes > 45 ? 1 + qualityBonus : 0);
  updateTechniqueProgress(userId, 'purityMastery', sessionData.purityScore > 85 ? 1 : 0, sessionData.purityScore > 85 ? 1 + qualityBonus : 0);
  updateTechniqueProgress(userId, 'consistencyMastery', sessionData.streak > 0 ? 1 : 0, sessionData.streak > 0 ? 1 : 0);
  updateTechniqueProgress(userId, 'bossMastery', sessionData.hasBossActive ? 1 : 0, sessionData.hasBossActive ? 1 + qualityBonus : 0);
}

export const MasteryService = {
  getOrCreateMasteryState(userId: string): MasteryState {
    return persistMasteryState(loadState(userId));
  },
  async getOrCreateMasteryStateAsync(userId: string): Promise<MasteryState> {
    return persistMasteryState(await loadStateAsync(userId));
  },
  applySessionXp(userId: string, xpGains: TechniqueXpGains): {
    updatedState: MasteryState;
    rankChanged: boolean;
    newRank?: MasteryRank;
    pointsGained: number;
  } {
    const currentState = loadState(userId);
    const techniques = {
      durationMastery: Math.min(25, currentState.techniques.durationMastery + xpGains.durationMastery),
      purityMastery: Math.min(25, currentState.techniques.purityMastery + xpGains.purityMastery),
      consistencyMastery: Math.min(25, currentState.techniques.consistencyMastery + xpGains.consistencyMastery),
      comebackMastery: Math.min(25, currentState.techniques.comebackMastery + xpGains.comebackMastery),
      bossMastery: Math.min(25, currentState.techniques.bossMastery + xpGains.bossMastery),
    };
    const pointsGained = Object.entries(techniques)
      .reduce((sum, [key, value]) => sum + value - currentState.techniques[key as TechniqueKey], 0);
    const totalMasteryPoints = currentState.totalMasteryPoints + pointsGained;
    const rank = resolveRank(totalMasteryPoints);
    const rankChanged = currentState.rank !== rank;
    const updatedState = persistMasteryState(hydrateChallenges(updateChallengeProgress({
      ...currentState,
      techniques,
      totalMasteryPoints,
      rank,
    }, xpGains)));
    return { updatedState, rankChanged, newRank: rankChanged ? rank : undefined, pointsGained };
  },
  claimChallenge(userId: string, challengeId: string): boolean {
    const state = loadState(userId);
    const challenge = state.activeChallenges.find((item) => item.id === challengeId);
    if (!challenge || challenge.status !== 'COMPLETED') return false;
    const totalMasteryPoints = state.totalMasteryPoints + challenge.masteryPoints;
    persistMasteryState(hydrateChallenges({
      ...state,
      totalMasteryPoints,
      rank: resolveRank(totalMasteryPoints),
      activeChallenges: state.activeChallenges.filter((item) => item.id !== challengeId),
    }));
    return true;
  },
  refreshChallenges(userId: string): MasteryState {
    return persistMasteryState(hydrateChallenges({ ...loadState(userId), activeChallenges: [] }));
  },
};
