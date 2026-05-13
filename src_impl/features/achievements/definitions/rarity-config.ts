/**
 * Rarity Configuration
 *
 * Colors and point values for achievement rarities.
 */

import type { AchievementRarity } from '../types';

export const RARITY_CONFIG: Record<AchievementRarity, { points: number; color: string }> = {
  COMMON: { points: 10, color: 'theme.colors.primary[500]' },
  UNCOMMON: { points: 25, color: 'theme.colors.primary[500]' },
  RARE: { points: 50, color: 'theme.colors.primary[500]' },
  EPIC: { points: 100, color: 'theme.colors.primary[500]' },
  LEGENDARY: { points: 250, color: 'theme.colors.primary[500]' },
};
