import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';
import type { Theme } from '../../../theme';
import { progressStepsStyles as styles, interpolateColor } from './progress-steps-styles';

export const Connector: React.FC<{
  completed: boolean;
  orientation: 'horizontal' | 'vertical';
  theme: Theme;
}> = ({ completed, orientation, theme }) => {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(completed ? 1 : 0);
  React.useEffect(() => {
    if (reducedMotion) {
      progress.value = completed ? 1 : 0;
      return;
    }
    progress.value = withTiming(completed ? 1 : 0, { duration: 300 });
  }, [completed, progress, reducedMotion]);
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.border.DEFAULT, theme.colors.success.DEFAULT],
    ),
  }));
  return (
    <Animated.View
      style={[
        styles.connector,
        orientation === 'horizontal'
          ? styles.connectorHorizontal
          : styles.connectorVertical,
        animatedStyle,
      ]}
    />
  );
};
