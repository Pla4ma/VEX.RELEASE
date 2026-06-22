import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Icon } from '../../../icons/components/Icon';
import { useTheme } from '../../../theme/ThemeContext';
import { rgbaColors } from '../../../theme/tokens/rgba-colors';
import { animationDuration } from '../../../theme/tokens/timing';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { sessionStart } from '../../../utils/haptics';

export function StreakCriticalAlert({
  hoursRemaining,
  streakDays,
  onStartSession,
}: {
  hoursRemaining: number;
  streakDays: number;
  onStartSession: () => void;
}): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const pulseStyle = useAnimatedStyle(() => ({
    backgroundColor: isReducedMotion
      ? rgbaColors.rgb_239_68_68_0_15
      : withRepeat(
          withSequence(
            withTiming(rgbaColors.rgb_239_68_68_0_3, {
              duration: animationDuration.slow,
            }),
            withTiming(rgbaColors.rgb_239_68_68_0_15, {
              duration: animationDuration.slow,
            }),
          ),
          -1,
          true,
        ),
  }));
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: isReducedMotion
          ? 0
          : withRepeat(
              withSequence(
                withTiming(-2, { duration: animationDuration.fast }),
                withTiming(2, { duration: animationDuration.fast }),
                withTiming(0, { duration: animationDuration.fast }),
              ),
              5,
              true,
            ),
      },
    ],
  }));
  return (
    <Pressable
      onPress={() => { sessionStart(); onStartSession(); }}
      accessibilityLabel={`Last chance: save your ${streakDays}-day streak`}
      accessibilityRole="button"
      accessibilityHint="Double tap to start a session now"
      style={getMinTouchTargetStyle()}
    >
      <Animated.View style={pulseStyle}>
        <Box
          px="lg"
          py="md"
          style={{
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.error.DEFAULT,
          }}
        >
          <Animated.View style={shakeStyle}>
            <Box alignItems="center" gap="xs">
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Icon
                  name="exclamation-triangle"
                  size="md"
                  color="error"
                  variant="solid"
                />
                <Text variant="h4" color="error.DEFAULT" fontWeight="800">
                  LAST CHANCE
                </Text>
                <Icon
                  name="exclamation-triangle"
                  size="md"
                  color="error"
                  variant="solid"
                />
              </Box>
              <Text variant="body" color="text.primary" textAlign="center">
                Your {streakDays}-day streak ends in {hoursRemaining} hours!
              </Text>
              <Text variant="bodySmall" color="error.DEFAULT" fontWeight="600">
                Tap to start a session now
              </Text>
            </Box>
          </Animated.View>
        </Box>
      </Animated.View>
    </Pressable>
  );
}

export { StreakCriticalAlert }