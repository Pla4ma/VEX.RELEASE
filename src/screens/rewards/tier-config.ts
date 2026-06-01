
/**
 * Colors below are documented game-mechanic config data — not UI styling.
 * Mapped to theme.colors.accent.* and theme.colors.semantic.* where applicable.
 */
export type ChestTier = 'WOOD' | 'SILVER' | 'GOLD' | 'LEGENDARY';

export interface TierConfig {
  colors: readonly string[];
  emoji: string;
  label: string;
  glow: string;
}

export const TIER_CONFIG: Record<ChestTier, TierConfig> = {
  WOOD: {
    colors: ['#8b4513', '#654321'] as const,
    emoji: '📦',
    label: 'Wood Chest',
    glow: '#8b4513',
  },
  SILVER: {
    colors: ['#c0c0c0', '#808080'] as const,
    emoji: '🥈',
    label: 'Silver Chest',
    glow: '#c0c0c0',
  },
  GOLD: {
    colors: ['#ffd700', '#ffa000'] as const,
    emoji: '🏆',
    label: 'Gold Chest',
    glow: '#ffd700',
  },
  LEGENDARY: {
    colors: [
      '#ffd700',
      '#ff6b35',
      '#8b5cf6',
    ] as const,
    emoji: '👑',
    label: 'Legendary Chest',
    glow: '#ff6b35',
  },
};
