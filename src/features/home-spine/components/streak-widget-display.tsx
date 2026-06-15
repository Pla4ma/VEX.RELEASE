import React from 'react';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { StreakWidgetProps } from './StreakWidget';

export function StreakWidgetSkeleton(): React.ReactNode {
  const { theme } = useTheme();

  return (
    <Box m="lg" p="lg" borderRadius="xl" bg={theme.colors.background.secondary}>
      <Box flexDirection="row" alignItems="center" gap="md">
        <Box
          width={56}
          height={56}
          borderRadius="full"
          bg={theme.colors.background.tertiary}
        />
        <Box gap="sm" flex={1}>
          <Box
            width={100}
            height={20}
            borderRadius="sm"
            bg={theme.colors.background.tertiary}
          />
          <Box
            width={150}
            height={14}
            borderRadius="sm"
            bg={theme.colors.background.tertiary}
          />
        </Box>
      </Box>
    </Box>
  );
}

export function FlameIcon({
  riskLevel,
  currentDays,
  size = 48,
}: {
  riskLevel: StreakWidgetProps['riskLevel'];
  currentDays: number;
  size?: number;
}): React.ReactNode {
  const flameAnimation = useAnimatedStyle(() => {
    const intensity =
      riskLevel === 'CRITICAL' ? 1.5 : riskLevel === 'HIGH' ? 1.3 : 1;

    return {
      transform: [
        {
          scale:
            riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
              ? withRepeat(
                  withSequence(
                    withSpring(1.1 * intensity, { damping: 3, stiffness: 200 }),
                    withSpring(0.95 * intensity, {
                      damping: 3,
                      stiffness: 200,
                    }),
                  ),
                  -1,
                  true,
                )
              : 1,
        },
      ],
    };
  });

  const icon = riskLevel === 'MEDIUM' ? '!' : currentDays > 0 ? '*' : '+';

  return (
    <Animated.Text style={[{ fontSize: size }, flameAnimation]}>
      {icon}
    </Animated.Text>
  );
}

export function RiskBanner({
  riskLevel,
  hoursRemaining,
}: {
  riskLevel: StreakWidgetProps['riskLevel'];
  hoursRemaining: number | null;
}): React.ReactNode | null {
  const { theme } = useTheme();

  if (riskLevel === 'NONE' || riskLevel === 'LOW' || hoursRemaining === null) {
    return null;
  }

  const isCritical = riskLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH';
  const bg = isCritical
    ? `${theme.colors.error[500]}30`
    : isHigh
      ? `${theme.colors.error[500]}20`
      : `${theme.colors.warning[500]}20`;
  const border =
    isCritical || isHigh
      ? theme.colors.error.DEFAULT
      : theme.colors.warning.DEFAULT;
  const text = isCritical
    ? `LAST CHANCE - ${hoursRemaining}h left!`
    : isHigh
      ? `Streak at risk - ${hoursRemaining} hours remaining`
      : `${hoursRemaining} hours to save your streak`;

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Box
        mt="md"
        p="sm"
        borderRadius="lg"
        bg={bg}
        borderWidth={1}
        borderColor={border}
      >
        <Text
          variant="caption"
          color={border}
          fontWeight="600"
          textAlign="center"
        >
          {text}
        </Text>
      </Box>
    </Animated.View>
  );
}
