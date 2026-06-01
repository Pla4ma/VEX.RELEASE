import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export interface EmptyStateProps {
  icon?: ReactNode | string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  style?: ViewStyle;
  testID?: string;
  variant?: 'default' | 'first-use' | 'error' | 'offline';
  featureName?: string;
}

export const PRESETS = {
  inventory: {
    icon: '',
    title: 'Your inventory is empty',
    description: 'Complete sessions to earn rewards and items.',
    actionLabel: 'Start a session',
  },
  feed: {
    icon: '',
    title: 'No activity yet',
    description: "Your squad's activity will appear here.",
    actionLabel: 'Invite Friends',
  },
  leaderboards: {
    icon: '',
    title: 'Leaderboard empty',
    description: "Complete this week's challenge to appear here.",
    actionLabel: 'View Challenge',
  },
  challenges: {
    icon: '',
    title: 'No active challenges',
    description: 'Daily and weekly challenges reset soon.',
    actionLabel: 'Browse All',
  },
  shop: {
    icon: '',
    title: 'Shop empty',
    description: 'New items arrive weekly. Check back soon!',
    actionLabel: 'View Featured',
  },
  squadWars: {
    icon: '',
    title: 'No active wars',
    description: 'Join a squad to participate in weekly wars.',
    actionLabel: 'Find a Squad',
  },
  offline: {
    icon: '',
    title: "You're offline",
    description:
      "Some features are unavailable. We'll sync when you reconnect.",
    variant: 'offline' as const,
  },
  error: {
    icon: '',
    title: 'Something went wrong',
    description: "We couldn't load this content. Try again in a moment.",
    variant: 'error' as const,
    actionLabel: 'Try Again',
  },
};
