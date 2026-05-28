// Progression service — public API surface
// Sub-modules: xp-core, xp-calculations, level-rewards, config, daily-progress, dedup, errors, failures, operation, read
export {
  addXpEnhanced as addXp,
  calculateXpBreakdown,
  calculateLevelThreshold,
  calculateLevelFromTotalXp,
  calculateProgressPercent,
  getDailyProgress,
  batchAddXp,
  configureProgressionService,
} from "./service-xp-core";
export { getLevelUpCelebrationRewards } from "./service-level-rewards";
export { getProgressionServiceConfig } from "./service-config";

import { configureProgressionService as configureSvc } from "./service-xp-core";

export function initializeProgressionService() {
  configureSvc({});
}
