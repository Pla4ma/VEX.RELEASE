// Barrel re-export — original file split into modules.
// This file re-exports everything for backward compatibility.

export { STREAK_STATES, STREAK_MILESTONES } from "./constants";
export {
  determineStreakState,
  calculateHoursUntilStreakBreak,
  getStreakStateInfo,
  getStreakVisualIndicator,
} from "./helpers";
export {
  awardInsurance,
  getAvailableInsuranceCount,
  getUserInsurance,
  canUseInsurance,
  useInsurance,
} from "./insurance";
export {
  createRecoveryPlan,
  getRecoveryPlan,
  progressRecovery,
  clearRecoveryPlan,
} from "./recovery";
export {
  checkMilestones,
  getNextMilestone,
  getMilestoneProgress,
  getStreakDisplayText,
  getStreakCelebrationMessage,
} from "./milestones";
export type {
  StreakState,
  StreakStateInfo,
  StreakMilestone,
  StreakInsurance,
  InsuranceSource,
  StreakRecoveryPlan,
  StreakProtectionResult,
} from "./types";
