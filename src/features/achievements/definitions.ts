/**
 * Achievement Definitions (Barrel Export)
 *
 * Re-exports all achievement definitions from the definitions/ directory.
 * This file exists for backward compatibility.
 *
 * 50+ achievements across 6 categories:
 * - Session (15)
 * - Streak (10)
 * - Boss (8)
 * - Social (7)
 * - Progression (7)
 * - Economy (3)
 */

export {
  RARITY_CONFIG,
  SESSION_ACHIEVEMENTS,
  STREAK_ACHIEVEMENTS,
  BOSS_ACHIEVEMENTS,
  SOCIAL_ACHIEVEMENTS,
  PROGRESSION_ACHIEVEMENTS,
  ECONOMY_ACHIEVEMENTS,
  ALL_ACHIEVEMENTS,
  ACHIEVEMENT_COUNT,
  getAchievementDisplayInfo,
  getRarityColor,
  getRarityPoints,
  calculateTotalAchievementPoints,
} from './definitions/index';

import { ALL_ACHIEVEMENTS } from './definitions/index';

// Backward-compatible function wrappers
export function getAchievementById(id: string) {
  const { getAchievementById: fn } = require('./definitions/helpers');
  return fn(ALL_ACHIEVEMENTS, id);
}

export function getAchievementsByCategory(
  category: import('./types').AchievementCategory,
) {
  const { getAchievementsByCategory: fn } = require('./definitions/helpers');
  return fn(ALL_ACHIEVEMENTS, category);
}

export function getAchievementsByRarity(
  rarity: import('./types').AchievementRarity,
) {
  const { getAchievementsByRarity: fn } = require('./definitions/helpers');
  return fn(ALL_ACHIEVEMENTS, rarity);
}

export function getVisibleAchievements() {
  const { getVisibleAchievements: fn } = require('./definitions/helpers');
  return fn(ALL_ACHIEVEMENTS);
}

// Phase 3.3 - Achievement System Enhancement
export {
  STUDY_ACHIEVEMENTS,
  BOSS_PHASE3_ACHIEVEMENTS,
  STREAK_EVOLUTION_ACHIEVEMENTS,
  ACHIEVEMENT_FEATURE_UNLOCKS,
  handleAchievementUnlock,
  getProgressionGuide,
  hasUnlockedFeature,
  getUnlockedFeatures,
  getNextMilestoneDays,
  getAchievementPreview,
  type FeatureUnlock,
  type ProgressionGuide,
} from './AchievementEnhancement';
