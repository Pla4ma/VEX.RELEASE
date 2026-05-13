/**
 * Empty State Component
 * Reusable empty state for content study feature
 */

import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { Icon } from '../../../icons';
import { createSheet } from '@/shared/ui/create-sheet';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  testID?: string;
}

// Predefined empty states for common scenarios
const styles = createSheet({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 280,
  },
  actionButton: {
    minWidth: 160,
  },
  secondaryAction: {
    marginTop: 16,
    paddingVertical: 8,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export * from "./EmptyState.part1";
