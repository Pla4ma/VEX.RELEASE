import { launchColors } from "@theme/tokens/launch-colors";

export type MasteryRank =
  | "APPRENTICE"
  | "ADEPT"
  | "EXPERT"
  | "MASTER"
  | "GRANDMASTER";

export interface MasteryState {
  userId: string;
  totalMasteryPoints: number;
  rank: MasteryRank;
  techniques: {
    durationMastery: number;
    purityMastery: number;
    consistencyMastery: number;
    comebackMastery: number;
    bossMastery: number;
  };
  activeChallenges: MasteryChallenge[];
  unlockedFeatures: string[];
  updatedAt: number;
}

export interface MasteryChallenge {
  id: string;
  technique: keyof MasteryState["techniques"];
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "ELITE";
  target: number;
  current: number;
  unit: string;
  masteryPoints: number;
  status: "ACTIVE" | "COMPLETED" | "CLAIMED";
  completedAt: number | null;
}

export const MASTERY_RANK_THRESHOLDS: Record<MasteryRank, number> = {
  APPRENTICE: 0,
  ADEPT: 10,
  EXPERT: 25,
  MASTER: 50,
  GRANDMASTER: 100,
};

export type TechniqueKey = keyof MasteryState["techniques"];

export type ChallengeTemplate = {
  title: string;
  description: string;
  target: number;
  unit: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "ELITE";
  points: number;
};

type RankDisplay = { title: string; color: string; icon: string };

const RANK_DISPLAYS: Record<MasteryRank, RankDisplay> = {
  APPRENTICE: {
    title: "Apprentice",
    color: launchColors.hex_8b4513,
    icon: "🌱",
  },
  ADEPT: {
    title: "Adept",
    color: launchColors.hex_4a5568,
    icon: "⚔️",
  },
  EXPERT: {
    title: "Expert",
    color: launchColors.hex_4169e1,
    icon: "🛡️",
  },
  MASTER: {
    title: "Master",
    color: launchColors.hex_9400d3,
    icon: "👑",
  },
  GRANDMASTER: {
    title: "Grandmaster",
    color: launchColors.hex_ffd700,
    icon: "⭐",
  },
};

export function getMasteryRankDisplay(rank: MasteryRank): RankDisplay {
  return RANK_DISPLAYS[rank] ?? RANK_DISPLAYS.APPRENTICE;
}
