/**
 * Skeleton Loading Component
 * Premium skeleton states with shimmer animation and multiple variants
 */

import React from 'react';
import { View, ViewStyle, DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, interpolate } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  mt?: number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  lines?: number;
  spacing?: number;
  style?: ViewStyle;
  animated?: boolean;
}

const styles = createSheet({
  container: {
    overflow: 'hidden',
  },
  skeleton: {
    backgroundColor: 'theme.colors.primary[500]',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'theme.colors.primary[500]',
    opacity: 0.5,
    width: 100,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'theme.colors.background.primary',
    borderRadius: 12,
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
    gap: 8,
  },
  cardTitle: {
    marginBottom: 8,
  },
  list: {
    gap: 12,
  },
  listItem: {
    marginBottom: 8,
  },
  chart: {
    backgroundColor: 'theme.colors.background.primary',
    borderRadius: 12,
    padding: 16,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
});

export * from "./Skeleton.types";
export * from "./Skeleton.part1";
