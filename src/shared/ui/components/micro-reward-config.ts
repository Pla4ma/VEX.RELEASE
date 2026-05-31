/**
 * MicroReward — Reward configuration and color mapping.
 */

import type { Theme } from '../../../theme';

export type RewardType =
  | 'xp'
  | 'coins'
  | 'gems'
  | 'streak'
  | 'level'
  | 'achievement'
  | 'milestone';

export const REWARD_CONFIG: Record<
  RewardType,
  { icon: string; label: string }
> = {
  xp: { icon: '⭐', label: 'XP Gained' },
  coins: { icon: '🪙', label: 'Coins' },
  gems: { icon: '💎', label: 'Gems' },
  streak: { icon: '🔥', label: 'Streak' },
  level: { icon: '📈', label: 'Level Up' },
  achievement: { icon: '🏆', label: 'Achievement' },
  milestone: { icon: '🎯', label: 'Milestone' },
};

export const getRewardColor = (type: RewardType, theme: Theme): string => {
  switch (type) {
    case 'xp':
      return theme.colors.primary[500];
    case 'coins':
      return theme.colors.warning.dark;
    case 'gems':
      return theme.colors.accent.blue;
    case 'streak':
      return theme.colors.accent.orange;
    case 'level':
      return theme.colors.success.dark;
    case 'achievement':
      return theme.colors.accent.purple;
    case 'milestone':
      return theme.colors.accent.pink;
    default:
      return theme.colors.primary[500];
  }
};
