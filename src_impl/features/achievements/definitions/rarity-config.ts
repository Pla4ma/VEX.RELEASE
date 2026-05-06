/**
 * Rarity Configuration
 *
 * Colors and point values for achievement rarities.
 */

import type { AchievementRarity } from '../types';

export const RARITY_CONFIG: Record<AchievementRarity, { points: number; color: string }> = {
  COMMON: { points: 10, color: '#9CA3AF' },
  UNCOMMON: { points: 25, color: '#22C55E' },
  RARE: { points: 50, color: '#3B82F6' },
  EPIC: { points: 100, color: '#A855F7' },
  LEGENDARY: { points: 250, color: '#F97316' },
};
