import React, { useEffect } from "react";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { Box } from "../../components/primitives/Box";
import { Text } from "../../components/primitives/Text";
import { useTheme } from "../../theme";

export function BossHealthBar({
  healthPercent,
  willDefeat,
}: {
  healthPercent: number;
  willDefeat: boolean;
}): JSX.Element {
  const { theme } = useTheme();
  const progressValue = useSharedValue(healthPercent / 100);
  useEffect(() => {
    progressValue.value = withSpring(healthPercent / 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [healthPercent, progressValue]);
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));
  const getHealthColor = () => {
    if (willDefeat) return theme.colors.success.DEFAULT;
    if (healthPercent <= 15) return theme.colors.error.DEFAULT;
    if (healthPercent <= 30) return theme.colors.warning.DEFAULT;
    if (healthPercent <= 50) return theme.colors.accent.orange;
    return theme.colors.error.DEFAULT;
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
        height={6}
        borderRadius="full"
        bg={theme.colors.background.tertiary}
        overflow="hidden"
      >
        <Animated.View
          style={[
            {
              height: "100%",
              borderRadius: 3,
              backgroundColor: getHealthColor(),
            },
            animatedStyle,
          ]}
        />
      </Box>
      <Box flexDirection="row" justifyContent="space-between" mt="xs">
        <Text variant="caption" color="text.tertiary" fontSize={10}>
          {healthPercent.toFixed(0)}% health
        </Text>
        {willDefeat && (
          <Text
            variant="caption"
            color={theme.colors.success.DEFAULT}
            fontWeight="700"
            fontSize={10}
          >
            ⚡ DEFEAT!
          </Text>
        )}
      </Box>
    </Box>
  );
}

export function DefeatCelebration(): JSX.Element {
  const { theme } = useTheme();
  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withSpring(1.05, { damping: 2, stiffness: 150 }),
            withSpring(1, { damping: 2, stiffness: 150 }),
          ),
          -1,
          true,
        ),
      },
    ],
  }));
  return (
    <Animated.View entering={FadeInUp.duration(400)} style={bounceStyle}>
      <Box
        mt="sm"
        p="xs"
        borderRadius="md"
        bg={`${theme.colors.success[500]}30`}
        borderWidth={1}
        borderColor={theme.colors.success.DEFAULT}
      >
        <Text
          variant="caption"
          color={theme.colors.success.dark}
          fontWeight="700"
          textAlign="center"
        >
          🏆 This session will defeat the boss!
        </Text>
      </Box>
    </Animated.View>
  );
}
