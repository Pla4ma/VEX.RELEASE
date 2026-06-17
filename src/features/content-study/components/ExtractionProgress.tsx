import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '../../../components/primitives/Button';
import { Card } from '../../../components/primitives/Card';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme/ThemeContext';
import type { ExtractionProgressProps } from '../types';

const STAGES = [
  { key: 'uploading', label: 'Uploading', icon: 'file' },
  { key: 'processing', label: 'Processing', icon: 'loading' },
  { key: 'extracting', label: 'Extracting', icon: 'search' },
  { key: 'analyzing', label: 'Analyzing', icon: 'activity' },
  { key: 'complete', label: 'Complete', icon: 'check-circle' },
  { key: 'failed', label: 'Failed', icon: 'exclamation-circle' },
] as const;
const FALLBACK_STAGE = {
  key: 'processing',
  label: 'Processing',
  icon: 'loading',
} as const;

function formatTime(seconds?: number): string {
  if (!seconds || seconds < 0) {
    return '';
  }
  if (seconds < 60) {
    return `${seconds}s remaining`;
  }
  return `${Math.ceil(seconds / 60)} min remaining`;
}

export function ExtractionProgress({
  stage,
  progress,
  estimatedTimeRemaining,
  onCancel,
  error,
  onRetry,
}: ExtractionProgressProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const pulse = useSharedValue(1);
  const fill = useSharedValue(0);
  const currentStageIndex = Math.max(
    0,
    STAGES.findIndex((item) => item.key === stage),
  );
  const currentStage = STAGES[currentStageIndex] ?? FALLBACK_STAGE;
  const isFailed = stage === 'failed';
  const isComplete = stage === 'complete';

  useEffect(() => {
    fill.value = withTiming(Math.max(0, Math.min(progress, 100)), {
      duration: 420,
    });
  }, [fill, progress]);

  useEffect(() => {
    if (isReducedMotion || isFailed || isComplete) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 720 }),
        withTiming(1, { duration: 720 }),
      ),
      -1,
      false,
    );
  }, [isComplete, isFailed, isReducedMotion, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value}%`,
  }));

  return (
    <Card
      size="lg"
      state={isFailed ? 'error' : isComplete ? 'success' : 'default'}
      variant="glass"
    >
      <View style={{ gap: theme.spacing[4] }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[3],
          }}
        >
          <Animated.View
            style={[
              {
                width: theme.spacing[6],
                height: theme.spacing[6],
                borderRadius: theme.borderRadius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isFailed
                  ? theme.colors.error[50]
                  : theme.colors.semantic.primarySoft,
              },
              pulseStyle,
            ]}
          >
            <Icon
              color={
                isFailed
                  ? theme.colors.semantic.danger
                  : theme.colors.semantic.primary
              }
              name={currentStage.icon}
              size="lg"
            />
          </Animated.View>
          <View style={{ flex: 1, gap: theme.spacing[1] }}>
            <Text
              color={isFailed ? 'error.DEFAULT' : 'text.primary'}
              variant="h3"
            >
              {isFailed
                ? 'Processing paused'
                : isComplete
                  ? 'Study source ready'
                  : currentStage.label}
            </Text>
            <Text color="text.secondary" variant="bodySmall">
              {isFailed
                ? (error?.message ?? 'VEX could not finish this source.')
                : formatTime(estimatedTimeRemaining) ||
                  'Building your study plan without blocking the app.'}
            </Text>
          </View>
        </View>

        {!isFailed ? (
          <View style={{ gap: theme.spacing[2] }}>
            <View
              style={{
                height: theme.spacing[2],
                borderRadius: theme.borderRadius.full,
                overflow: 'hidden',
                backgroundColor: theme.colors.semantic.backgroundMuted,
              }}
            >
              <Animated.View
                style={[
                  {
                    height: theme.spacing[2],
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: isComplete
                      ? theme.colors.semantic.success
                      : theme.colors.semantic.primary,
                  },
                  fillStyle,
                ]}
              />
            </View>
            <Text color="text.muted" textAlign="right" variant="caption">
              {Math.round(progress)}%
            </Text>
          </View>
        ) : null}

        {error?.details ? (
          <Text color="text.muted" variant="caption">
            The source is safe to retry when storage finishes syncing.
          </Text>
        ) : null}

        {isFailed && onRetry ? (
          <Button onPress={onRetry} size="sm">
            <Text>Retry Extraction</Text>
          </Button>
        ) : null}
        {!isFailed && !isComplete && onCancel ? (
          <Button onPress={onCancel} size="sm" variant="ghost">
            <Text>Cancel</Text>
          </Button>
        ) : null}
      </View>
    </Card>
  );
}
