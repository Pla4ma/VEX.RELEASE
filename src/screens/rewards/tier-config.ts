import { lightColors } from '@/theme/tokens/colors';

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
    colors: [lightColors.text.muted, lightColors.text.muted] as const,
    emoji: '📦',
    label: 'Wood Chest',
    glow: lightColors.text.muted,
  },
  SILVER: {
    colors: [lightColors.text.disabled, lightColors.text.disabled] as const,
    emoji: '🥈',
    label: 'Silver Chest',
    glow: lightColors.text.disabled,
  },
  GOLD: {
    colors: [lightColors.semantic.vexGold, lightColors.semantic.warning] as const,
    emoji: '🏆',
    label: 'Gold Chest',
    glow: lightColors.semantic.vexGold,
  },
  LEGENDARY: {
    colors: [
      lightColors.semantic.vexGold,
      lightColors.semantic.warning,
      lightColors.accent.purple,
    ] as const,
    emoji: '👑',
    label: 'Legendary Chest',
    glow: lightColors.semantic.warning,
  },
};
