import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeInUp,
} from "react-native-reanimated";
import { Box, Text, Button } from "@/components/primitives";
import { useTheme } from "@/theme";
import * as Sentry from "@sentry/react-native";
import { getRiskText } from "./helpers";
import { GambleActionButtons } from "./GambleActionButtons";

interface PromptViewProps {
  streakDays: number;
  hoursRemaining: number;
  shieldsAvailable: number;
  onUseShield: () => void;
  onGamble: () => void;
  onDismiss: () => void;
}

export const PromptView: React.FC<PromptViewProps> = ({
  streakDays,
  hoursRemaining,
  shieldsAvailable,
  onUseShield,
  onGamble,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const shakeX = useSharedValue(0);
  const countdownScale = useSharedValue(1);

  useEffect(() => {
    shakeX.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 100 }),
        withTiming(2, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      ),
      -1,
      true,
    );
    countdownScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
    Sentry.addBreadcrumb({
      category: "streaks",
      message: "Streak gamble prompt shown",
      level: "warning",
      data: { streakDays, hoursRemaining, shieldsAvailable },
    });
  }, [countdownScale, hoursRemaining, shakeX, shieldsAvailable, streakDays]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));
  const countdownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countdownScale.value }],
  }));

  const riskInfo = getRiskText(
    hoursRemaining,
    theme.colors.error.DEFAULT,
    theme.colors.warning.DEFAULT,
  );

  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Box
        p={5}
        borderRadius={20}
        bg={theme.colors.background.secondary}
        style={{
          borderWidth: 3,
          borderColor: theme.colors.error.DEFAULT,
          shadowColor: theme.colors.error.DEFAULT,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <Box alignItems="center" mb={4}>
          <Animated.View style={[shakeStyle]}>
            <Text
              variant="h2"
              color={riskInfo.color}
              style={{
                textShadowColor: riskInfo.color,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 15,
              }}
            >
              🔥 STREAK AT RISK!
            </Text>
          </Animated.View>

          <Box flexDirection="row" alignItems="baseline" gap={1} mt={2}>
            <Animated.View style={countdownStyle}>
              <Text variant="hero" color={theme.colors.error.DEFAULT}>
                {Math.ceil(hoursRemaining * 10) / 10}h
              </Text>
            </Animated.View>
            <Text variant="body" color={theme.colors.text.secondary}>
              until your {streakDays}-day streak breaks
            </Text>
          </Box>

          <Text variant="caption" color={theme.colors.error.DEFAULT} mt={1}>
            {riskInfo.text}
          </Text>
        </Box>

        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          mb={5}
          p={4}
          borderRadius={16}
          bg={theme.colors.background.primary}
        >
          <Text style={{ fontSize: 32 }}>🔥</Text>
          <Box ml={3}>
            <Text variant="h3" color={theme.colors.text.primary}>
              {streakDays} Day Streak
            </Text>
            <Text variant="caption" color={theme.colors.text.tertiary}>
              Don't lose your progress!
            </Text>
          </Box>
        </Box>

        <GambleActionButtons
          shieldsAvailable={shieldsAvailable}
          onUseShield={onUseShield}
          onGamble={onGamble}
        />

        <Box mt={4} alignItems="center">
          <Button
            variant="ghost"
            size="sm"
            onPress={onDismiss}
            accessibilityLabel="Risk it without reminder"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text color={theme.colors.text.tertiary}>
              I'll risk it (don't remind me)
            </Text>
          </Button>
        </Box>
      </Box>
    </Animated.View>
  );
};
