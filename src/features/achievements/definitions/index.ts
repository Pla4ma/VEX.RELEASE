/**
 * Achievement Definitions
 *
 * 50+ achievements across 6 categories:
 * - Session (15)
 * - Streak (10)
 * - Boss (8)
 * - Social (7)
 * - Progression (7)
 * - Economy (3)
 */

export { RARITY_CONFIG } from "./rarity-config";
export { SESSION_ACHIEVEMENTS } from "./session-achievements";
export { STREAK_ACHIEVEMENTS } from "./streak-achievements";
export { BOSS_ACHIEVEMENTS } from "./boss-achievements";
export { SOCIAL_ACHIEVEMENTS } from "./social-achievements";
export { PROGRESSION_ACHIEVEMENTS } from "./progression-achievements";
export { ECONOMY_ACHIEVEMENTS } from "./economy-achievements";

export {
  getAchievementById,
  getAchievementsByCategory,
  getAchievementsByRarity,
  getVisibleAchievements,
  getAchievementDisplayInfo,
  getRarityColor,
  getRarityPoints,
  calculateTotalAchievementPoints,
} from "./helpers";

import type { Achievement } from "../types";
import { SESSION_ACHIEVEMENTS } from "./session-achievements";
import { STREAK_ACHIEVEMENTS } from "./streak-achievements";
import { BOSS_ACHIEVEMENTS } from "./boss-achievements";
import { SOCIAL_ACHIEVEMENTS } from "./social-achievements";
import { PROGRESSION_ACHIEVEMENTS } from "./progression-achievements";
import { ECONOMY_ACHIEVEMENTS } from "./economy-achievements";

export const ALL_ACHIEVEMENTS: Achievement[] = [
  ...SESSION_ACHIEVEMENTS,
  ...STREAK_ACHIEVEMENTS,
  ...BOSS_ACHIEVEMENTS,
  ...SOCIAL_ACHIEVEMENTS,
  ...PROGRESSION_ACHIEVEMENTS,
  ...ECONOMY_ACHIEVEMENTS,
];

export const ACHIEVEMENT_COUNT = ALL_ACHIEVEMENTS.length;
