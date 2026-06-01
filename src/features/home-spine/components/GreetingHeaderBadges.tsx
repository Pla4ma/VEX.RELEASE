import React from 'react';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSpring,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { CompanionMood } from '../../companion/types';

export function StreakIndicator({
  days,
  hoursRemaining,
}: {
  days: number;
  hoursRemaining?: number | null;
}): JSX.Element {
  const { theme } = useTheme();
  const isAtRisk =
    hoursRemaining !== null &&
    hoursRemaining !== undefined &&
    hoursRemaining <= 24;
  const isCritical =
    hoursRemaining !== null &&
    hoursRemaining !== undefined &&
    hoursRemaining <= 6;
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isAtRisk
          ? withRepeat(
              withSpring(1.1, { damping: 2, stiffness: 100 }),
              -1,
              true,
            )
          : 1,
      },
    ],
  }));
  const flameColor = isCritical
    ? theme.colors.error.DEFAULT
    : isAtRisk
      ? theme.colors.warning.DEFAULT
      : theme.colors.accent.orange;
  return (
    <Animated.View style={pulseStyle}>
      <Box
        flexDirection="row"
        alignItems="center"
        gap="xs"
        px="sm"
        py="xs"
        borderRadius="full"
        bg={isAtRisk ? `${flameColor}20` : undefined}
        borderWidth={isAtRisk ? 1 : 0}
        borderColor={flameColor}
      >
        <Text fontSize={16}>F</Text>
        <Text
          variant="caption"
          color={isAtRisk ? 'error.DEFAULT' : 'text.secondary'}
          fontWeight="600"
        >
          {days}
        </Text>
        {isAtRisk && hoursRemaining !== null ? (
          <Text
            variant="caption"
            color={isCritical ? 'error.DEFAULT' : 'warning.DEFAULT'}
          >
            - {hoursRemaining}h
          </Text>
        ) : null}
      </Box>
    </Animated.View>
  );
}

export function LevelBadge({ level }: { level: number }): JSX.Element {
  const { theme } = useTheme();
  return (
    <Box px="sm" py="xs" borderRadius="full" bg={theme.colors.primary[500]}>
      <Text
        variant="caption"
        color={theme.colors.text.inverse}
        fontWeight="700"
      >
        LVL {level}
      </Text>
    </Box>
  );
}

export function getCompanionMoodSymbol(mood: CompanionMood): string {
  const symbols: Record<CompanionMood, string> = {
    SLEEPY: 'o',
    CONTENT: '+',
    FOCUSED: '#',
    DETERMINED: '^',
    ECSTATIC: '*',
    STRUGGLING: '~',
    DANGER: '!',
  };
  return symbols[mood];
}
