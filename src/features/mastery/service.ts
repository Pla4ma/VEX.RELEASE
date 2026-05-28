import type { MasteryRank, MasteryState } from "./types";
import {
  type TechniqueXpGains,
  type TechniqueKey,
  resolveRank,
  hydrateChallenges,
  loadState,
  loadStateAsync,
  updateChallengeProgress,
  updateTechniqueProgress,
} from "./mastery-helpers";
import { persistMasteryState } from "./repository";

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
  updateTechniqueProgress(
    userId,
    "durationMastery",
    sessionMinutes > 45 ? 1 : 0,
    sessionMinutes > 45 ? 1 + qualityBonus : 0,
  );
  updateTechniqueProgress(
    userId,
    "purityMastery",
    sessionData.purityScore > 85 ? 1 : 0,
    sessionData.purityScore > 85 ? 1 + qualityBonus : 0,
  );
  updateTechniqueProgress(
    userId,
    "consistencyMastery",
    sessionData.streak > 0 ? 1 : 0,
    sessionData.streak > 0 ? 1 : 0,
  );
  updateTechniqueProgress(
    userId,
    "bossMastery",
    sessionData.hasBossActive ? 1 : 0,
    sessionData.hasBossActive ? 1 + qualityBonus : 0,
  );
}

export const MasteryService = {
  getOrCreateMasteryState(userId: string): MasteryState {
    return persistMasteryState(loadState(userId));
  },
  async getOrCreateMasteryStateAsync(userId: string): Promise<MasteryState> {
    return persistMasteryState(await loadStateAsync(userId));
  },
  applySessionXp(
    userId: string,
    xpGains: TechniqueXpGains,
  ): {
    updatedState: MasteryState;
    rankChanged: boolean;
    newRank?: MasteryRank;
    pointsGained: number;
  } {
    const currentState = loadState(userId);
    const techniques = {
      durationMastery: Math.min(
        25,
        currentState.techniques.durationMastery + xpGains.durationMastery,
      ),
      purityMastery: Math.min(
        25,
        currentState.techniques.purityMastery + xpGains.purityMastery,
      ),
      consistencyMastery: Math.min(
        25,
        currentState.techniques.consistencyMastery + xpGains.consistencyMastery,
      ),
      comebackMastery: Math.min(
        25,
        currentState.techniques.comebackMastery + xpGains.comebackMastery,
      ),
      bossMastery: Math.min(
        25,
        currentState.techniques.bossMastery + xpGains.bossMastery,
      ),
    };
    const pointsGained = Object.entries(techniques).reduce(
      (sum, [key, value]) =>
        sum + value - currentState.techniques[key as TechniqueKey],
      0,
    );
    const totalMasteryPoints = currentState.totalMasteryPoints + pointsGained;
    const rank = resolveRank(totalMasteryPoints);
    const rankChanged = currentState.rank !== rank;
    const updatedState = persistMasteryState(
      hydrateChallenges(
        updateChallengeProgress(
          {
            ...currentState,
            techniques,
            totalMasteryPoints,
            rank,
          },
          xpGains,
        ),
      ),
    );
    return {
      updatedState,
      rankChanged,
      newRank: rankChanged ? rank : undefined,
      pointsGained,
    };
  },
  claimChallenge(userId: string, challengeId: string): boolean {
    const state = loadState(userId);
    const challenge = state.activeChallenges.find(
      (item) => item.id === challengeId,
    );
    if (!challenge || challenge.status !== "COMPLETED") return false;
    const totalMasteryPoints =
      state.totalMasteryPoints + challenge.masteryPoints;
    persistMasteryState(
      hydrateChallenges({
        ...state,
        totalMasteryPoints,
        rank: resolveRank(totalMasteryPoints),
        activeChallenges: state.activeChallenges.filter(
          (item) => item.id !== challengeId,
        ),
      }),
    );
    return true;
  },
  refreshChallenges(userId: string): MasteryState {
    return persistMasteryState(
      hydrateChallenges({ ...loadState(userId), activeChallenges: [] }),
    );
  },
};
