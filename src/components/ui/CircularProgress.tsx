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

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  accessibilityLabel?: string;
}

        const elementStyle_76 = {
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
};
const clampProgress = (value: number): number =>
  Math.max(0, Math.min(1, value));

export const CircularProgress = React.memo<CircularProgressProps>(function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 8,
  color,
  backgroundColor,
  showPercentage = true,
  animated = true,
  accessibilityLabel,
}) {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const animatedValue = useSharedValue(0);
  const nextProgress = clampProgress(progress);
  const circleColor = color ?? theme.colors.semantic.primary;
  const bgCircleColor = backgroundColor ?? theme.colors.semantic.border;

  useEffect(() => {
    if (reducedMotion) {
      animatedValue.value = nextProgress;
      return;
    }
    animatedValue.value = animated
      ? withTiming(nextProgress, { duration: 800 })
      : nextProgress;
  }, [animated, animatedValue, nextProgress, reducedMotion]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animatedValue.value * 360}deg` }],
  }));

  return (
    <View
      style={{ height: size, width: size }}
      accessibilityLabel={accessibilityLabel ?? `${Math.round(nextProgress * 100)} percent complete`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(nextProgress * 100) }}
    >
      <Animated.View style={[{ position: 'absolute' }, rotationStyle]}>
        <View
          style={{
            borderColor: bgCircleColor,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            height: size,
            position: 'absolute',
            width: size,
          }}
        />
        <View
          style={elementStyle_76}
        />
      </Animated.View>
      {showPercentage ? (
        <View
          style={{
            alignItems: 'center',
            bottom: 0,
            justifyContent: 'center',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        >
          <Text color={circleColor} fontSize={18} fontWeight="700">
            {Math.round(nextProgress * 100)}%
          </Text>
        </View>
      ) : null}
    </View>
  );
});
export default CircularProgress;
