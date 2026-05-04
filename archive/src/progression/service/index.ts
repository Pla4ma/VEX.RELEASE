/**
 * Progression Service Domain Modules
 *
 * Split from original ProgressionService.ts for maintainability.
 */

// State management
export {
  getInitialState,
  calculateXPForLevel,
  loadState,
  saveState,
  clearState,
} from './state-manager';

// Boost management
export { BoostManager } from './boost-manager';

// Reward granting
export { grantLevelUpRewards } from './reward-granter';

// Prestige management
export {
  getPrestigeRewardPreview,
  canPrestige,
  prestige,
  getSeasonalPrestigeBonus,
} from './prestige-manager';

// XP processing
export {
  processXPEntry,
  syncWithEnhancedService,
  type EnhancedProgressionContext,
} from './xp-processor';
