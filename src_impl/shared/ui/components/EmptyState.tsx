/**
 * Empty State Component
 *
 * Premium empty states for all list screens with:
 * - Consistent illustration placeholders
 * - Contextual CTAs
 * - Accessibility support
 * - Theme integration
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives';
import { Button } from '../../../components';
import { EnterAnimation } from './EnterAnimation';
import { createSheet } from '@/shared/ui/create-sheet';

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Preset Configurations
// ============================================================================

const PRESETS = {
  inventory: {
    icon: '📦',
    title: 'Your inventory is empty',
    description: 'Complete sessions to earn rewards and items.',
    actionLabel: 'Start a Session',
  },
  feed: {
    icon: '📰',
    title: 'No activity yet',
    description: 'Your squad\'s activity will appear here.',
    actionLabel: 'Invite Friends',
  },
  leaderboards: {
    icon: '🏆',
    title: 'Leaderboard empty',
    description: 'Complete this week\'s challenge to appear here.',
    actionLabel: 'View Challenge',
  },
  challenges: {
    icon: '🎯',
    title: 'No active challenges',
    description: 'Daily and weekly challenges reset soon.',
    actionLabel: 'Browse All',
  },
  shop: {
    icon: '🛍️',
    title: 'Shop empty',
    description: 'New items arrive weekly. Check back soon!',
    actionLabel: 'View Featured',
  },
  squadWars: {
    icon: '⚔️',
    title: 'No active wars',
    description: 'Join a squad to participate in weekly wars.',
    actionLabel: 'Find a Squad',
  },
  offline: {
    icon: '📡',
    title: 'You\'re offline',
    description: 'Some features are unavailable. We\'ll sync when you reconnect.',
    variant: 'offline' as const,
  },
  error: {
    icon: '⚠️',
    title: 'Something went wrong',
    description: 'We couldn\'t load this content. Try again in a moment.',
    variant: 'error' as const,
    actionLabel: 'Try Again',
  },
};

// ============================================================================
// Component
// ============================================================================
// ============================================================================
// Preset Exports
// ============================================================================
// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    textAlign: 'center',
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  title: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 24,
    lineHeight: 22,
  },
  featureContext: {
    marginBottom: 24,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  primaryAction: {
    minWidth: 200,
  },
  secondaryAction: {
    minWidth: 200,
  },
  offlineBadge: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});

export default EmptyState;

export * from "./EmptyState.types";
export * from "./EmptyState.part1";
