import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { createSheet } from '@/shared/ui/create-sheet';
type SkeletonWidth = number | `${number}%` | 'auto';

interface SkeletonProps {
  width?: SkeletonWidth;
  height?: number;
  borderRadius?: number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  lines?: number;
  spacing?: number;
  animate?: boolean;
}

const styles = createSheet({
  container: {
    width: '100%',
  },
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderText: {
    marginLeft: 12,
    gap: 4,
  },
  cardContent: {
    gap: 8,
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  listItemContent: {
    flex: 1,
    gap: 4,
  },
});

export * from "./Skeleton.types";
export * from "./Skeleton.types";
export * from "./Skeleton.part1";
