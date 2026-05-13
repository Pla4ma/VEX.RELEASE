/**
 * Loading Overlay Component
 * Premium loading states with progress indicators and blur effects
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ViewStyle,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useFadeIn } from '../hooks/useReanimated';
import { Skeleton, SkeletonCard, SkeletonList } from './Skeleton';
import { createSheet } from '@/shared/ui/create-sheet';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  blur?: boolean;
  style?: ViewStyle;
}

// Hook for pulse animation
function usePulseAnimation() {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, [scale]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
}

// Inline loading states for sections
interface SectionLoadingProps {
  type?: 'text' | 'card' | 'chart' | 'list';
  count?: number;
  style?: ViewStyle;
}

// Progress indicator for long operations
interface ProgressIndicatorProps {
  progress: number;
  message?: string;
  submessage?: string;
  style?: ViewStyle;
}

// Inline progress for buttons
interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
}

const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: 'theme.colors.primary[500]',
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 16,
    width: 200,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 2,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: 'theme.colors.primary[500]',
    textAlign: 'center',
  },
  sectionContainer: {
    padding: 16,
  },
  sectionItem: {
    marginBottom: 12,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  progressContent: {
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
  progressBarLarge: {
    width: '100%',
    height: 8,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 4,
  },
  progressMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: 'theme.colors.primary[500]',
    marginBottom: 4,
  },
  progressSubmessage: {
    fontSize: 14,
    color: 'theme.colors.primary[500]',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: 'theme.colors.primary[500]',
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonLoadingText: {
    fontSize: 14,
    color: 'theme.colors.primary[500]',
  },
});

export * from "./LoadingOverlay.types";
export * from "./LoadingOverlay.part1";
