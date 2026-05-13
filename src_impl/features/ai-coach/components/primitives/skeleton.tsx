/**
 * Skeleton Loading States
 *
 * Premium skeleton placeholders with shimmer animation
 */

import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  shimmer?: boolean;
}

// Pre-built skeleton layouts
const styles = createSheet({
  container: {
    backgroundColor: 'theme.colors.primary[500]',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    gap: 8,
  },
  textLine: {
    marginBottom: 8,
  },
  cardContainer: {
    padding: 16,
    backgroundColor: 'theme.colors.background.primary',
    borderRadius: 12,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  headerLine: {
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
  },
  personaContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  personaCard: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'theme.colors.background.primary',
    borderRadius: 12,
    flex: 1,
  },
  personaName: {
    marginTop: 8,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'theme.colors.background.primary',
    borderRadius: 8,
  },
  listContent: {
    flex: 1,
    gap: 6,
  },
  listLine: {
    marginBottom: 4,
  },
  streakContainer: {
    gap: 16,
  },
  streakContent: {
    padding: 16,
    gap: 12,
  },
  streakBadge: {
    alignSelf: 'center',
  },
  comebackContainer: {
    padding: 16,
    backgroundColor: 'theme.colors.background.primary',
    borderRadius: 12,
    gap: 16,
  },
  progressBar: {
    marginBottom: 8,
  },
  comebackContent: {
    gap: 12,
  },
});

export * from "./skeleton.types";
export * from "./skeleton.part1";
