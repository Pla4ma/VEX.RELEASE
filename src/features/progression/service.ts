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
} from './service-enhanced';
export { getLevelUpCelebrationRewards } from './service-enhanced-rewards';
