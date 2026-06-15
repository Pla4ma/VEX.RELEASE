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
import { Icon } from '../../../icons/components/Icon';
import { useTheme } from '../../../theme/ThemeContext';
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
  const pulseStyle = useAnimatedStyle(() => ({
    backgroundColor: withRepeat(
      withSequence(
        withTiming(`${theme.colors.error.DEFAULT}40`, { duration: 400 }),
        withTiming(`${theme.colors.error.DEFAULT}20`, { duration: 400 }),
      ),
      -1,
      true,
    ),
  }));
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withRepeat(
          withSequence(
            withTiming(-2, { duration: 50 }),
            withTiming(2, { duration: 50 }),
            withTiming(0, { duration: 50 }),
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
    >
      <Animated.View style={[pulseStyle]}>
        <Box
          px="lg"
          py="md"
          style={{
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.error.DEFAULT,
          }}
        >
          <Animated.View style={[shakeStyle]}>
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

export default StreakCriticalAlert;
