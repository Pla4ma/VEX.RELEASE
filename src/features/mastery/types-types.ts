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
