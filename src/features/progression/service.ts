// Canonical progression service — delegates to service-enhanced for all operations
export {
  addXpEnhanced as addXp,
  calculateXpBreakdown,
  calculateLevelThreshold,
  calculateLevelFromTotalXp,
  calculateProgressPercent,
  getDailyProgress,
  batchAddXp,
  configureProgressionService,
} from "./service-enhanced";
export { getLevelUpCelebrationRewards } from "./service-enhanced-rewards";
export { getProgressionServiceConfig } from "./service-enhanced-config";

// Service getter for compatibility with hooks expecting service pattern
// Note: The progression service now uses a functional pattern, not a class-based pattern
// The configureProgressionService function configures global settings
import { configureProgressionService as configureSvc } from "./service-enhanced";

export function initializeProgressionService() {
  configureSvc({});
}
