export type ChestTier = 'WOOD' | 'SILVER' | 'GOLD' | 'LEGENDARY';

export interface TierConfig {
  colors: readonly string[];
  emoji: string;
  label: string;
  glow: string;
}

export const TIER_CONFIG: Record<ChestTier, TierConfig> = {
  WOOD: {
    colors: ['theme.colors.primary[500]', 'theme.colors.primary[500]'] as const,
    emoji: '📦',
    label: 'Wood Chest',
    glow: 'theme.colors.primary[500]',
  },
  SILVER: {
    colors: ['theme.colors.primary[500]', 'theme.colors.primary[500]'] as const,
    emoji: '🥈',
    label: 'Silver Chest',
    glow: 'theme.colors.primary[500]',
  },
  GOLD: {
    colors: ['theme.colors.error.DEFAULT', 'theme.colors.error.DEFAULT'] as const,
    emoji: '🏆',
    label: 'Gold Chest',
    glow: 'theme.colors.error.DEFAULT',
  },
  LEGENDARY: {
    colors: ['theme.colors.error.DEFAULT', 'theme.colors.error.DEFAULT', 'theme.colors.primary[500]'] as const,
    emoji: '👑',
    label: 'Legendary Chest',
    glow: 'theme.colors.error.DEFAULT',
  },
};
