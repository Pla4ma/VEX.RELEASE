import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../primitives/Text';
import { useTheme } from '../../theme/ThemeContext';

interface ProgressBarProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
  label?: string;
}

const clampProgress = (value: number): number =>
  Math.max(0, Math.min(1, value));

export const ProgressBar = React.memo<ProgressBarProps>(function ProgressBar({
  progress,
  color,
  backgroundColor,
  height = 8,
  showPercentage = false,
  animated = true,
  label,
}) {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const animatedValue = useSharedValue(0);
  const nextProgress = clampProgress(progress);
  const barColor = color ?? theme.colors.semantic.primary;
  const bgColor = backgroundColor ?? theme.colors.semantic.border;

  useEffect(() => {
    if (reducedMotion) {
      animatedValue.value = nextProgress;
      return;
    }
    animatedValue.value = animated
      ? withTiming(nextProgress, { duration: 500 })
      : nextProgress;
  }, [animated, animatedValue, nextProgress, reducedMotion]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedValue.value * 100}%`,
  }));

  return (
    <View style={{ width: '100%' }}>
      {label || showPercentage ? (
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: theme.spacing[1],
          }}
        >
          {label ? (
            <Text color="text.secondary" variant="caption">
              {label}
            </Text>
          ) : (
            <View />
          )}
          {showPercentage ? (
            <Text color={barColor} fontWeight="700" variant="caption">
              {Math.round(nextProgress * 100)}%
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        style={{
          backgroundColor: bgColor,
          borderRadius: theme.borderRadius.full,
          height,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: barColor,
              borderRadius: theme.borderRadius.full,
              height: '100%',
            },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
});

export default ProgressBar;
