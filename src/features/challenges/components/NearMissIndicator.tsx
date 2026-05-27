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
  FadeIn,
} from "react-native-reanimated";
import { Box, Text, Button } from "@/components/primitives";
import { useTheme } from "@/theme";
import * as Sentry from "@sentry/react-native";
import { getAnalyticsService } from "@/analytics/AnalyticsService";
interface NearMissIndicatorProps {
  challengeId: string;
  userName?: string;
  progressPercent: number;
  hoursUntilNext: number;
  onAcknowledge: () => void;
  onViewNextChallenge?: () => void;
}
const NEAR_MISS_THRESHOLD = 75;
const COMPLETE_THRESHOLD = 100;
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
  if (!isValidNearMiss) {
    Sentry.addBreadcrumb({
      category: "challenges",
      message: `NearMissIndicator rendered with invalid progress: ${progressPercent}%`,
      level: "warning",
    });
    return null;
  }
  const pulseOpacity = useSharedValue(0.6);
  const progressWidth = useSharedValue(0);
  const shakeX = useSharedValue(0);
  useEffect(() => {
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
  }, [challengeId, progressPercent, progressWidth, pulseOpacity, shakeX]);
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
  const getNearMissMessage = (progress: number): string => {
    if (progress >= 95) {
      return "So close! Just a tiny bit more!";
    }
    if (progress >= 90) {
      return "Almost had it! Next time for sure!";
    }
    if (progress >= 85) {
      return "Great effort! You're getting close!";
    }
    if (progress >= 80) {
      return "Good progress! Keep pushing!";
    }
    return "Not bad! You'll nail it next time!";
  };
  const formatTimeUntil = (hours: number): string => {
    if (hours <= 1) {
      return "Less than an hour";
    }
    if (hours < 24) {
      return `${Math.ceil(hours)} hours`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.ceil(hours % 24);
    if (remainingHours === 0) {
      return `${days} day${days > 1 ? "s" : ""}`;
    }
    return `${days}d ${remainingHours}h`;
  };
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
        {}
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

          <Text
            variant="body"
            color={theme.colors.text.secondary}
            mt={2}
            textAlign="center"
          >
            {getNearMissMessage(progressPercent)}
          </Text>
        </Box>

        {}
        <Box mb={5}>
          <Box
            height={12}
            borderRadius={6}
            bg={theme.colors.background.tertiary}
            style={{ overflow: "hidden" }}
          >
            {}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg={theme.colors.background.tertiary}
            />

            {}
            <Animated.View
              style={[
                {
                  height: "100%",
                  backgroundColor: theme.colors.error.DEFAULT,
                  borderRadius: 6,
                },
                progressStyle,
              ]}
            />

            {}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  right: 0,
                  top: -2,
                  bottom: -2,
                  width: 4,
                  backgroundColor: theme.colors.error.DEFAULT,
                  borderRadius: 2,
                },
                pulseStyle,
              ]}
            />
          </Box>

          {}
          <Box flexDirection="row" justifyContent="space-between" mt={2}>
            <Text variant="caption" color={theme.colors.text.tertiary}>
              0%
            </Text>
            <Text
              variant="caption"
              color={theme.colors.error.DEFAULT}
              fontWeight="bold"
            >
              {Math.round(progressPercent)}%
            </Text>
            <Text variant="caption" color={theme.colors.text.tertiary}>
              100%
            </Text>
          </Box>
        </Box>

        {}
        <Box
          p={4}
          borderRadius={12}
          bg={theme.colors.background.primary}
          mb={4}
        >
          <Box flexDirection="row" alignItems="center" gap={2} mb={2}>
            <Text style={{ fontSize: 20 }}>💪</Text>
            <Text
              variant="body"
              color={theme.colors.text.primary}
              fontWeight="semibold"
            >
              You almost had it!
            </Text>
          </Box>

          <Text variant="bodySmall" color={theme.colors.text.secondary}>
            Near-misses like this mean you're on the right track.
            {userName ? `${userName}, y` : "Y"}ou were just
            {Math.round(100 - progressPercent)}% away from completing this
            challenge.
          </Text>
        </Box>

        {}
        <Animated.View entering={FadeIn.delay(300)}>
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            p={3}
            borderRadius={12}
            style={{
              backgroundColor: `${theme.colors.info.DEFAULT}15`,
              borderWidth: 1,
              borderColor: `${theme.colors.info.DEFAULT}30`,
            }}
            mb={4}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>⏰</Text>
            <Text variant="body" color={theme.colors.info.DEFAULT}>
              Next challenge in {formatTimeUntil(hoursUntilNext)}
            </Text>
          </Box>
        </Animated.View>

        {}
        <Box gap={3}>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={onAcknowledge}
            accessibilityLabel="👍 I'll Get It Next Time button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            👍 I'll Get It Next Time
          </Button>

          {onViewNextChallenge && (
            <Button
              variant="outline"
              size="md"
              fullWidth
              onPress={onViewNextChallenge}
              accessibilityLabel="🎯 View Upcoming Challenges button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              🎯 View Upcoming Challenges
            </Button>
          )}
        </Box>

        {}
        <Box mt={4} alignItems="center">
          <Text
            variant="caption"
            color={theme.colors.text.tertiary}
            textAlign="center"
          >
            "This one got away... but the next one is yours! 🎯"
          </Text>
        </Box>
      </Box>
    </Animated.View>
  );
};
export function trackChallengeNearMiss(
  challengeId: string,
  progressPercent: number,
): void {
  Sentry.addBreadcrumb({
    category: "challenges",
    message: "Challenge near-miss recorded",
    level: "info",
    data: {
      challengeId,
      progressPercent,
      threshold: NEAR_MISS_THRESHOLD,
      type: "near_miss",
    },
  });
  getAnalyticsService().track("challenge_near_miss", {
    challenge_id: challengeId,
    progress_percent: progressPercent,
    miss_by_percent: 100 - progressPercent,
  });
}
export function useIsNearMiss(
  progressPercent: number,
  status: "completed" | "expired" | "failed",
): boolean {
  return (
    status === "expired" &&
    progressPercent >= NEAR_MISS_THRESHOLD &&
    progressPercent < COMPLETE_THRESHOLD
  );
}
export default NearMissIndicator;
export { NEAR_MISS_THRESHOLD, COMPLETE_THRESHOLD };
