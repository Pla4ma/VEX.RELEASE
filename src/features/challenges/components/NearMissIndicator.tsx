import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  FadeInUp,
} from "react-native-reanimated";
import { Box, Text } from "@/components/primitives";
import { useTheme } from "@/theme";
import * as Sentry from "@sentry/react-native";
import {
  NEAR_MISS_THRESHOLD,
  COMPLETE_THRESHOLD,
  getNearMissMessage,
  trackChallengeNearMiss,
} from "./near-miss-helpers";
import { NearMissProgressBar } from "./NearMissProgressBar";
import { NearMissActions } from "./NearMissActions";

interface NearMissIndicatorProps {
  challengeId: string;
  userName?: string;
  progressPercent: number;
  hoursUntilNext: number;
  onAcknowledge: () => void;
  onViewNextChallenge?: () => void;
}

export const NearMissIndicator: React.FC<NearMissIndicatorProps> = ({
  challengeId,
  userName,
  progressPercent,
  hoursUntilNext,
  onAcknowledge,
  onViewNextChallenge,
}) => {
  const { theme } = useTheme();
  const isValidNearMiss =
    progressPercent >= NEAR_MISS_THRESHOLD &&
    progressPercent < COMPLETE_THRESHOLD;

  const pulseOpacity = useSharedValue(0.6);
  const progressWidth = useSharedValue(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (!isValidNearMiss) return;
    progressWidth.value = withSpring(progressPercent / 100, {
      damping: 15,
      stiffness: 50,
    });
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.4, { duration: 600 }),
      ),
      -1,
      true,
    );
    shakeX.value = withDelay(
      1000,
      withSequence(
        withTiming(-3, { duration: 100 }),
        withTiming(3, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      ),
    );
    trackChallengeNearMiss(challengeId, progressPercent);
  }, [isValidNearMiss, challengeId, progressPercent, progressWidth, pulseOpacity, shakeX]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  if (!isValidNearMiss) {
    Sentry.addBreadcrumb({
      category: "challenges",
      message: `NearMissIndicator rendered with invalid progress: ${progressPercent}%`,
      level: "warning",
    });
    return null;
  }

  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Box
        p={5}
        borderRadius={20}
        bg={theme.colors.background.secondary}
        style={{
          borderWidth: 2,
          borderColor: theme.colors.error.DEFAULT,
          shadowColor: theme.colors.error.DEFAULT,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
          elevation: 5,
        }}
      >
        <Box alignItems="center" mb={4}>
          <Animated.View style={shakeStyle}>
            <Text
              variant="h3"
              color={theme.colors.error.DEFAULT}
              style={{
                textShadowColor: theme.colors.error.light,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
              }}
            >
              SO CLOSE! {Math.round(progressPercent)}% Complete
            </Text>
          </Animated.View>
          <Text variant="body" color={theme.colors.text.secondary} mt={2} textAlign="center">
            {getNearMissMessage(progressPercent)}
          </Text>
        </Box>

        <NearMissProgressBar
          progressPercent={progressPercent}
          progressStyle={progressStyle}
          pulseStyle={pulseStyle}
          errorColor={theme.colors.error.DEFAULT}
          tertiaryBg={theme.colors.background.tertiary}
          tertiaryText={theme.colors.text.tertiary}
        />

        <NearMissActions
          userName={userName}
          progressPercent={progressPercent}
          hoursUntilNext={hoursUntilNext}
          onAcknowledge={onAcknowledge}
          onViewNextChallenge={onViewNextChallenge}
          errorColor={theme.colors.error.DEFAULT}
          primaryBg={theme.colors.background.primary}
          primaryText={theme.colors.text.primary}
          secondaryText={theme.colors.text.secondary}
          tertiaryText={theme.colors.text.tertiary}
          infoColor={theme.colors.info.DEFAULT}
        />
      </Box>
    </Animated.View>
  );
};

export default NearMissIndicator;
export { NEAR_MISS_THRESHOLD, COMPLETE_THRESHOLD, useIsNearMiss } from "./near-miss-helpers";
