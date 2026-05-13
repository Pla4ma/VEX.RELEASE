/**
 * Empty State Component
 * Rich empty states with illustrations, CTAs, and animations
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useFadeIn, useSlideIn } from '../hooks/useReanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
  animated?: boolean;
}

// Pre-built empty state variants with VEX personality
// Phase 23.1 — Empty states with personality
const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'theme.colors.primary[500]',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'theme.colors.primary[500]',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: 'theme.colors.primary[500]',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: 'theme.colors.primary[500]',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'theme.colors.background.primary',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'theme.colors.primary[500]',
    fontSize: 16,
    fontWeight: '500',
  },
});

export * from "./EmptyState.types";
export * from "./EmptyState.part1";
