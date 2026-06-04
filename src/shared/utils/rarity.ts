import { lightColors } from '@/theme/tokens/colors';

/**
 * Rarity Utilities
 *
 * Helper functions for working with item rarities.
 */

export type ItemRarity =
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY'
  | 'MYTHIC';

/**
 * Get color for rarity level
 */
export function getRarityColor(rarity: ItemRarity): string {
  const colors: Record<ItemRarity, string> = {
    COMMON: lightColors.text.muted, // Gray
    UNCOMMON: lightColors.semantic.success, // Green
    RARE: lightColors.accent.blue, // Blue
    EPIC: lightColors.accent.purple, // Purple
    LEGENDARY: lightColors.semantic.warning, // Orange
    MYTHIC: lightColors.semantic.vexGold, // Gold
  };

  return colors[rarity] ?? colors.COMMON;
}

/**
 * Get display label for rarity
 */
export function getRarityLabel(rarity: ItemRarity): string {
  const labels: Record<ItemRarity, string> = {
    COMMON: 'Common',
    UNCOMMON: 'Uncommon',
    RARE: 'Rare',
    EPIC: 'Epic',
    LEGENDARY: 'Legendary',
    MYTHIC: 'Mythic',
  };

  return labels[rarity] ?? rarity;
}

/**
 * Get numeric tier for rarity (for sorting/comparison)
 */
export function getRarityTier(rarity: ItemRarity): number {
  const tiers: Record<ItemRarity, number> = {
    COMMON: 1,
    UNCOMMON: 2,
    RARE: 3,
    EPIC: 4,
    LEGENDARY: 5,
    MYTHIC: 6,
  };

  return tiers[rarity] ?? 0;
}

/**
 * Compare two rarities (returns negative if a < b, positive if a > b)
 */
export function compareRarity(a: ItemRarity, b: ItemRarity): number {
  return getRarityTier(a) - getRarityTier(b);
}

/**
 * Sort items by rarity (highest first)
 */
export function sortByRarityDesc<T extends { rarity: ItemRarity }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => compareRarity(b.rarity, a.rarity));
}

/**
 * Sort items by rarity (lowest first)
 */
export function sortByRarityAsc<T extends { rarity: ItemRarity }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => compareRarity(a.rarity, b.rarity));
}
