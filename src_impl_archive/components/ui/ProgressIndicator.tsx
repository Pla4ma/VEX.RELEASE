import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Text } from '../primitives';
import { useTheme } from '../../theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
  label?: string;
}

const clampProgress = (value: number): number => Math.max(0, Math.min(1, value));

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
  const nextProgress = clampProgress(progress);
  const barColor = color ?? theme.colors.semantic.primary;
  const bgColor = backgroundColor ?? theme.colors.semantic.border;

  useEffect(() => {
    animatedValue.value = animated ? withTiming(nextProgress, { duration: 500 }) : nextProgress;
  }, [animated, animatedValue, nextProgress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${animatedValue.value * 100}%` }));

  return (
    <View style={{ width: '100%' }}>
      {label || showPercentage ? (
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[1] }}>
          {label ? <Text color="text.secondary" variant="caption">{label}</Text> : <View />}
          {showPercentage ? <Text color={barColor} fontWeight="700" variant="caption">{Math.round(nextProgress * 100)}%</Text> : null}
        </View>
      ) : null}
      <View style={{ backgroundColor: bgColor, borderRadius: theme.borderRadius.full, height, overflow: 'hidden' }}>
        <Animated.View style={[{ backgroundColor: barColor, borderRadius: theme.borderRadius.full, height: '100%' }, fillStyle]} />
      </View>
    </View>
  );
};

interface CircularProgressProps {
  progress: number;
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
  const nextProgress = clampProgress(progress);
  const circleColor = color ?? theme.colors.semantic.primary;
  const bgCircleColor = backgroundColor ?? theme.colors.semantic.border;

  useEffect(() => {
    animatedValue.value = animated ? withTiming(nextProgress, { duration: 800 }) : nextProgress;
  }, [animated, animatedValue, nextProgress]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animatedValue.value * 360}deg` }],
  }));

  return (
    <View style={{ height: size, width: size }}>
      <Animated.View style={[{ position: 'absolute' }, rotationStyle]}>
        <View style={{ borderColor: bgCircleColor, borderRadius: size / 2, borderWidth: strokeWidth, height: size, position: 'absolute', width: size }} />
        <View
          style={{
            borderBottomColor: 'transparent',
            borderColor: circleColor,
            borderLeftColor: 'transparent',
            borderRadius: size / 2,
            borderRightColor: circleColor,
            borderTopColor: circleColor,
            borderWidth: strokeWidth,
            height: size,
            transform: [{ rotate: '-45deg' }],
            width: size,
          }}
        />
      </Animated.View>
      {showPercentage ? (
        <View style={{ alignItems: 'center', bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0 }}>
          <Text color={circleColor} fontSize={18} fontWeight="700">{Math.round(nextProgress * 100)}%</Text>
        </View>
      ) : null}
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
  const stepColor = color ?? theme.colors.semantic.primary;
  return (
    <View style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
      {Array.from({ length: steps }, (_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const fillColor = isCompleted ? stepColor : isCurrent ? theme.colors.semantic.surface : theme.colors.semantic.border;
        return (
          <View key={index} style={{ alignItems: 'center', flex: 1, flexDirection: 'row' }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: fillColor,
                borderColor: isCurrent ? stepColor : fillColor,
                borderRadius: 14,
                borderWidth: isCurrent ? 2 : 0,
                height: 28,
                justifyContent: 'center',
                width: 28,
              }}
            >
              <Text color={isCompleted ? 'text.inverse' : isCurrent ? stepColor : 'text.muted'} fontSize={12} fontWeight="700">
                {isCompleted ? '✓' : index + 1}
              </Text>
            </View>
            {labels?.[index] ? (
              <Text color={isCurrent || isCompleted ? stepColor : 'text.muted'} fontSize={10} textAlign="center" style={{ left: 0, position: 'absolute', right: 0, top: 32 }}>
                {labels[index]}
              </Text>
            ) : null}
            {index < steps - 1 ? <View style={{ backgroundColor: isCompleted ? stepColor : theme.colors.semantic.border, flex: 1, height: 2, marginHorizontal: 4 }} /> : null}
          </View>
        );
      })}
    </View>
  );
};
