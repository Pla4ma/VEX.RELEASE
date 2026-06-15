import React from 'react';
import Animated, {
  useAnimatedStyle,
  withDelay,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

export function BossPreviewSkeleton(): React.ReactNode {
  const { theme } = useTheme();
  return (
    <Box m="lg" p="lg" borderRadius="xl" bg={theme.colors.background.secondary}>
      <Box flexDirection="row" alignItems="center" gap="md">
        <Box
          width={56}
          height={56}
          borderRadius="lg"
          bg={theme.colors.background.tertiary}
        />
        <Box gap="sm" flex={1}>
          <Box
            width={120}
            height={18}
            borderRadius="sm"
            bg={theme.colors.background.tertiary}
          />
          <Box
            width="100%"
            height={8}
            borderRadius="full"
            bg={theme.colors.background.tertiary}
          />
        </Box>
      </Box>
    </Box>
  );
}

export function HealthBar({
  healthPercent,
  animated = true,
}: {
  healthPercent: number;
  animated?: boolean;
}): React.ReactNode {
  const { theme } = useTheme();
  const progressValue = useSharedValue(0);
  React.useEffect(() => {
    if (animated) {
      progressValue.value = withDelay(
        300,
        withSpring(healthPercent / 100, { damping: 15, stiffness: 100 }),
      );
    } else {
      progressValue.value = healthPercent / 100;
    }
  }, [healthPercent, animated, progressValue]);
  const barStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));
  const getHealthColor = () => {
    if (healthPercent <= 15) {
      return theme.colors.error.DEFAULT;
    }
    if (healthPercent <= 30) {
      return theme.colors.warning.DEFAULT;
    }
    if (healthPercent <= 50) {
      return theme.colors.accent.orange;
    }
    return theme.colors.success.DEFAULT;
  };
  return (
    <Box>
      <Box
        accessibilityLabel={`Boss health: ${healthPercent.toFixed(0)} percent`}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(healthPercent),
          text: `${healthPercent.toFixed(0)} percent`,
        }}
        accessible
        height={8}
        borderRadius="full"
        bg={theme.colors.background.tertiary}
        overflow="hidden"
      >
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: 4,
              backgroundColor: getHealthColor(),
            },
            barStyle,
          ]}
        />
      </Box>
      <Box flexDirection="row" justifyContent="space-between" mt="xs">
        <Text variant="caption" color="text.tertiary">
          {healthPercent.toFixed(0)}% health
        </Text>
        {healthPercent <= 20 && (
          <Text
            variant="caption"
            color={theme.colors.error.DEFAULT}
            fontWeight="600"
          >
            FINISH HIM!
          </Text>
        )}
      </Box>
    </Box>
  );
}

export function EscapeTimer({
  hoursRemaining,
}: {
  hoursRemaining: number;
}): React.ReactNode {
  const { theme } = useTheme();
  const isUrgent = hoursRemaining <= 6;
  const isWarning = hoursRemaining <= 12;
  return (
    <Box flexDirection="row" alignItems="center" gap="xs">
      <Text fontSize={12} />
      <Text
        variant="caption"
        color={
          isUrgent
            ? theme.colors.error.DEFAULT
            : isWarning
              ? theme.colors.warning.DEFAULT
              : 'text.tertiary'
        }
        fontWeight={isUrgent ? '600' : '400'}
      >
        {isUrgent ? 'URGENT ' : ''}
        Escapes in {hoursRemaining}h
      </Text>
    </Box>
  );
}
