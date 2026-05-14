export type ChestTier = 'WOOD' | 'SILVER' | 'GOLD' | 'LEGENDARY';

export interface TierConfig {
  colors: readonly string[];
  emoji: string;
  label: string;
  glow: string;
}

export const TIER_CONFIG: Record<ChestTier, TierConfig> = {
  WOOD: {
    colors: ['#8B4513', '#654321'] as const,
    emoji: '📦',
    label: 'Wood Chest',
    glow: '#8B4513',
  },
  SILVER: {
    colors: ['#C0C0C0', '#808080'] as const,
    emoji: '🥈',
    label: 'Silver Chest',
    glow: '#C0C0C0',
  },
  GOLD: {
    colors: ['#FFD700', '#FFA000'] as const,
    emoji: '🏆',
    label: 'Gold Chest',
    glow: '#FFD700',
  },
  LEGENDARY: {
    colors: ['#FFD700', '#FF6B35', '#8B5CF6'] as const,
    emoji: '👑',
    label: 'Legendary Chest',
    glow: '#FF6B35',
  },
};
