import {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export interface AtRiskBannerProps {
  /** Hours remaining until streak breaks (null if not at risk) */
  hoursRemaining: number | null;
  /** Current streak days */
  currentStreak: number;
  /** Called when user taps to start session */
  onStartSession: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Get urgency message based on hours remaining
 */
export function getUrgencyMessage(
  hoursRemaining: number | null,
  streakDays: number,
): {
  headline: string;
  subtext: string;
  tone: "critical" | "urgent" | "warning";
} {
  if (hoursRemaining === null || hoursRemaining === undefined) {
    return {
      headline: "Streak Safe",
      subtext: "No urgent action needed",
      tone: "warning",
    };
  }
  if (hoursRemaining <= 1) {
    return {
      headline: `⚠️ FINAL HOUR — ${streakDays}-Day Streak!`,
      subtext: "Start a session NOW to save your streak",
      tone: "critical",
    };
  }
  if (hoursRemaining <= 4) {
    return {
      headline: `🔥 ${hoursRemaining}h Left to Save ${streakDays}-Day Streak`,
      subtext: "Your streak expires soon — start a focus session",
      tone: "urgent",
    };
  }
  if (hoursRemaining <= 8) {
    return {
      headline: `⏰ ${hoursRemaining} Hours Remaining`,
      subtext: `Protect your ${streakDays}-day streak before bed`,
      tone: "warning",
    };
  }
  return {
    headline: "Streak at Risk",
    subtext: `${hoursRemaining} hours remaining`,
    tone: "warning",
  };
}

/**
 * Animated pulse for critical urgency
 */
export function usePulseAnimation(isCritical: boolean) {
  return useAnimatedStyle(() => ({
    transform: isCritical
      ? [
          {
            scale: withRepeat(
              withSequence(
                withTiming(1.02, { duration: 800 }),
                withTiming(1, { duration: 800 }),
              ),
              -1,
              true,
            ),
          },
        ]
      : [],
  }));
}
