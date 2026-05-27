/**
 * Mastery System - Barrel Export
 *
 * Skill-based progression that rewards technique, not just time.
 * Players feel themselves getting BETTER at focusing.
 */

export type { MasteryState, MasteryRank, MasteryChallenge } from "./types";
export {
  MASTERY_RANK_THRESHOLDS,
  calculateTechniqueXp,
  generateMasteryChallenges,
  getMasteryRankDisplay,
} from "./types";

// Components
export { MasteryCard } from "./components/MasteryCard";
export { MasteryRankBadge } from "./components/MasteryRankBadge";
export { TechniqueBar } from "./components/TechniqueBar";
export {
  MasteryUnlockGate,
  LockedFeaturePreview,
  isFeatureUnlocked,
  getRequiredRank,
  getPointsToUnlock,
  RANK_UNLOCKS,
  type UnlockableFeature,
} from "./components/MasteryUnlockGate";

// Service
export { MasteryService } from "./service";
