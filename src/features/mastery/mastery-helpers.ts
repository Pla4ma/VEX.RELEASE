import {
  MASTERY_RANK_THRESHOLDS,
  type MasteryRank,
  type MasteryState,
} from "./types";
import { generateMasteryChallenges } from "./challenge-generator";
import {
  loadMasteryState,
  loadStoredMasteryState,
  persistMasteryState,
} from "./repository";

export type TechniqueXpGains = {
  durationMastery: number;
  purityMastery: number;
  consistencyMastery: number;
  comebackMastery: number;
  bossMastery: number;
};

export type StoredMasteryState = MasteryState;
export type TechniqueKey = keyof StoredMasteryState["techniques"];

export function resolveRank(points: number): MasteryRank {
  if (points >= MASTERY_RANK_THRESHOLDS.GRANDMASTER) return "GRANDMASTER";
  if (points >= MASTERY_RANK_THRESHOLDS.MASTER) return "MASTER";
  if (points >= MASTERY_RANK_THRESHOLDS.EXPERT) return "EXPERT";
  if (points >= MASTERY_RANK_THRESHOLDS.ADEPT) return "ADEPT";
  return "APPRENTICE";
}

export function hydrateChallenges(state: StoredMasteryState): StoredMasteryState {
  const nextChallenges = state.activeChallenges.filter(
    (challenge) => challenge.status !== "CLAIMED",
  );
  while (nextChallenges.length < 3) {
    const generated = generateMasteryChallenges(
      state.techniques,
      state.rank,
    ).filter(
      (challenge) => !nextChallenges.some((item) => item.id === challenge.id),
    );
    if (generated.length === 0) break;
    nextChallenges.push(...generated.slice(0, 3 - nextChallenges.length));
  }
  return { ...state, activeChallenges: nextChallenges.slice(0, 3) };
}

export function createDefaultState(userId: string): StoredMasteryState {
  return hydrateChallenges({
    userId,
    totalMasteryPoints: 0,
    rank: "APPRENTICE",
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

export function loadState(userId: string): StoredMasteryState {
  return hydrateChallenges(
    loadStoredMasteryState(userId) ?? createDefaultState(userId),
  );
}

export async function loadStateAsync(userId: string): Promise<StoredMasteryState> {
  return hydrateChallenges(
    (await loadMasteryState(userId)) ?? createDefaultState(userId),
  );
}

export function updateChallengeProgress(
  state: StoredMasteryState,
  xpGains: TechniqueXpGains,
): StoredMasteryState {
  return {
    ...state,
    activeChallenges: state.activeChallenges.map((challenge) => {
      if (challenge.status !== "ACTIVE") return challenge;
      const nextCurrent = Math.min(
        challenge.target,
        challenge.current + xpGains[challenge.technique],
      );
      return {
        ...challenge,
        current: nextCurrent,
        status:
          nextCurrent >= challenge.target ? "COMPLETED" : challenge.status,
        completedAt:
          nextCurrent >= challenge.target ? Date.now() : challenge.completedAt,
      };
    }),
  };
}

export function updateTechniqueProgress(
  userId: string,
  technique: TechniqueKey,
  delta: number,
  masteryPoints: number,
): void {
  if (delta <= 0 && masteryPoints <= 0) return;
  const currentState = loadState(userId);
  const xpGains: TechniqueXpGains = {
    durationMastery: technique === "durationMastery" ? delta : 0,
    purityMastery: technique === "purityMastery" ? delta : 0,
    consistencyMastery: technique === "consistencyMastery" ? delta : 0,
    comebackMastery: technique === "comebackMastery" ? delta : 0,
    bossMastery: technique === "bossMastery" ? delta : 0,
  };
  const totalMasteryPoints =
    currentState.totalMasteryPoints + Math.max(0, masteryPoints);
  persistMasteryState(
    hydrateChallenges(
      updateChallengeProgress(
        {
          ...currentState,
          techniques: {
            ...currentState.techniques,
            [technique]: Math.min(
              25,
              currentState.techniques[technique] + delta,
            ),
          },
          totalMasteryPoints,
          rank: resolveRank(totalMasteryPoints),
        },
        xpGains,
      ),
    ),
  );
}
