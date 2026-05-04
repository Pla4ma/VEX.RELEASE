/**
 * Progress Indicator Components
 *
 * Linear, circular, and stepped progress indicators.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { createSheet } from '@/shared/ui/create-sheet';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  backgroundColor,
  height = 8,
  showPercentage = false,
  animated = true,
  label,
}) => {
  const { theme } = useTheme();
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    const nextProgress = Math.max(0, Math.min(1, progress));
    if (animated) {
      animatedValue.value = withTiming(nextProgress, { duration: 500 });
    } else {
      animatedValue.value = nextProgress;
    }
  }, [progress, animated, animatedValue]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedValue.value * 100}%`,
  }));

  const barColor = color || (theme.colors.primary as any)[500];
  const bgColor = backgroundColor || (theme.colors.border as any)?.DEFAULT || theme.colors.border;
  const percentage = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  return (
    <View style={styles.progressBarContainer}>
      {(label || showPercentage) && (
        <View style={styles.progressHeader}>
          {label && <Text style={styles.progressLabel}>{label}</Text>}
          {showPercentage && (
            <Text style={[styles.progressPercentage, { color: barColor }]}>
              {percentage}%
            </Text>
          )}
        </View>
      )}
      <View style={[styles.progressBar, { height, backgroundColor: bgColor }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: barColor,
            },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
};

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  color,
  backgroundColor,
  showPercentage = true,
  animated = true,
}) => {
  const { theme } = useTheme();
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    const nextProgress = Math.max(0, Math.min(1, progress));
    if (animated) {
      animatedValue.value = withTiming(nextProgress, { duration: 800 });
    } else {
      animatedValue.value = nextProgress;
    }
  }, [progress, animated, animatedValue]);

  const circleColor = color || theme.colors.primary[500];
  const bgCircleColor = backgroundColor || theme.colors.border.DEFAULT;
  const percentage = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animatedValue.value * 360}deg` }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={[
          styles.circularProgress,
          {
            width: size,
            height: size,
          },
          rotationStyle,
        ]}
      >
        <View
          style={[
            styles.circularBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: bgCircleColor,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.circularFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: circleColor,
              borderTopColor: circleColor,
              borderRightColor: circleColor,
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
      </Animated.View>

      {showPercentage && (
        <View style={styles.circularTextContainer}>
          <Text style={[styles.circularPercentage, { color: circleColor }]}>
            {percentage}%
          </Text>
        </View>
      )}
    </View>
  );
};

interface StepIndicatorProps {
  steps: number;
  currentStep: number;
  labels?: string[];
  color?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  labels,
  color,
}) => {
  const { theme } = useTheme();
  const stepColor = color || theme.colors.primary[500];

  return (
    <View style={styles.stepContainer}>
      {Array.from({ length: steps }, (_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.step,
                isCompleted && { backgroundColor: stepColor },
                isCurrent && {
                  backgroundColor: '#fff',
                  borderWidth: 2,
                  borderColor: stepColor,
                },
                isPending && { backgroundColor: '#E0E0E0' },
              ]}
            >
              {isCompleted ? (
                <Text style={styles.stepCheck}>✓</Text>
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    isCurrent && { color: stepColor },
                    isPending && { color: '#999' },
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>

            {labels && labels[index] && (
              <Text
                style={[
                  styles.stepLabel,
                  isCompleted && { color: stepColor },
                  isCurrent && { color: stepColor, fontWeight: '600' },
                  isPending && { color: '#999' },
                ]}
              >
                {labels[index]}
              </Text>
            )}

            {index < steps - 1 && (
              <View
                style={[
                  styles.stepLine,
                  isCompleted && { backgroundColor: stepColor },
                  !isCompleted && { backgroundColor: '#E0E0E0' },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = createSheet({
  progressBarContainer: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  circularProgress: {
    position: 'absolute',
  },
  circularBackground: {
    position: 'absolute',
  },
  circularFill: {
    position: 'absolute',
  },
  circularTextContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  step: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepCheck: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 4,
    position: 'absolute',
    top: 32,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
});
