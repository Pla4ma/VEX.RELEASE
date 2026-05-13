import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  Pressable,
  View,
  type ViewStyle,
} from 'react-native';

import { createSheet } from '@/shared/ui/create-sheet';

interface StateComponentProps {
  style?: ViewStyle;
  testID?: string;
}

interface LoadingStateProps extends StateComponentProps {
  message?: string;
  submessage?: string;
  progress?: number;
  showProgress?: boolean;
  size?: 'small' | 'large';
  variant?: 'spinner' | 'skeleton' | 'progress';
  skeletonItems?: number;
}

interface EmptyStateProps extends StateComponentProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

interface ErrorStateProps extends StateComponentProps {
  error: Error | string;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  showDetails?: boolean;
}

interface SuccessStateProps extends StateComponentProps {
  icon?: string;
  title: string;
  subtitle?: string;
  autoDismiss?: boolean;
  dismissDelay?: number;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

type SkeletonWidth = number | `${number}%`;

interface SkeletonProps extends StateComponentProps {
  variant?: 'card' | 'list' | 'text' | 'avatar' | 'chip';
  count?: number;
  width?: SkeletonWidth;
  height?: number;
  circle?: boolean;
  animated?: boolean;
}

interface DisabledStateProps extends StateComponentProps {
  reason?: string;
  overlay?: boolean;
  children: React.ReactNode;
}

interface StateWrapperProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  isSuccess?: boolean;
  loadingProps?: Omit<LoadingStateProps, 'testID'>;
  emptyProps?: Omit<EmptyStateProps, 'testID'>;
  errorProps?: Omit<ErrorStateProps, 'error' | 'testID'>;
  successProps?: Omit<SuccessStateProps, 'testID'>;
  children: React.ReactNode;
  testID?: string;
}

function usePulseAnimation(enabled = true): Animated.Value {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [enabled, pulseAnim]);

  return pulseAnim;
}

function useFadeAnimation(visible: boolean, duration = 300): Animated.Value {
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [duration, fadeAnim, visible]);

  return fadeAnim;
}

const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  skeletonContainer: {
    width: '100%',
  },
  spinner: {
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 4,
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingMessage: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingSubmessage: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF444420',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetails: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dismissButtonText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledContainer: {
    position: 'relative',
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  disabledReasonContainer: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledReasonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  disabledReasonText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default {
  Skeleton,
  LoadingState,
  EmptyState,
  ErrorState,
  SuccessState,
  DisabledState,
  StateWrapper,
};

export * from "./state-components.types";
export * from "./state-components.types";
export * from "./state-components.part1";
export * from "./state-components.part2";
