/**
 * StartSessionButton Component
 *
 * Large, full-width primary CTA for starting focus sessions.
 * Handles all states: default, resume, streak risk, squad presence.
 *
 * @phase 1A.3
 */

import React, { useMemo } from "react";
import { Pressable, ActivityIndicator } from "react-native";
import Animated, { useAnimatedStyle, withSpring, withRepeat, withSequence, cancelAnimation, useSharedValue } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

export interface StartSessionButtonProps {
  /** Primary label text */
  label?: string;
  /** Secondary subtitle text */
  subtitle?: string;
  /** Resume state - shows elapsed time if resuming */
  resumeTimeSeconds?: number | null;
  /** Number of squad members currently focusing */
  squadMembersFocusing?: number;
  /** Streak risk level for urgency styling */
  streakRiskLevel?: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** Hours remaining until streak breaks */
  streakHoursRemaining?: number | null;
  /** Loading state while creating session */
  isLoading?: boolean;
  /** Whether user has an active (paused) session */
  hasActiveSession?: boolean;
  /** Press handler */
  onPress: () => void;
  /** Optional test ID */
  testID?: string;
  /** PHASE 7.3: Boss name for Final Strike mode */
  bossName?: string;
  /** PHASE 7.3: Final Strike mode (boss at 1-15% health) */
  isFinalStrike?: boolean;
}

/**
 * Get button colors based on state
 * PHASE 7.3: Added Final Strike mode (red glow)
 */
function useButtonColors(streakRiskLevel: StartSessionButtonProps["streakRiskLevel"], hasActiveSession: boolean, isFinalStrike: boolean = false) {
  const { theme } = useTheme();

  return useMemo(() => {
    // PHASE 7.3: Final Strike takes precedence
    if (isFinalStrike) {
      return {
        gradient: [theme.colors.error.dark, theme.colors.error.DEFAULT] as const,
        shadow: theme.colors.error.DEFAULT,
        isFinalStrike: true,
      };
    }

    if (hasActiveSession) {
      return {
        gradient: [theme.colors.accent.purple, theme.colors.primary[600]] as const,
        shadow: theme.colors.accent.purple,
        isFinalStrike: false,
      };
    }

    switch (streakRiskLevel) {
      case "CRITICAL":
        return {
          gradient: [theme.colors.error.dark, theme.colors.error.DEFAULT] as const,
          shadow: theme.colors.error.DEFAULT,
          isFinalStrike: false,
        };
      case "HIGH":
        return {
          gradient: [theme.colors.error.DEFAULT, theme.colors.warning[500]] as const,
          shadow: theme.colors.error.DEFAULT,
          isFinalStrike: false,
        };
      case "MEDIUM":
        return {
          gradient: [theme.colors.warning[500], theme.colors.accent.orange] as const,
          shadow: theme.colors.warning[500],
          isFinalStrike: false,
        };
      default:
        return {
          gradient: [theme.colors.primary[600], theme.colors.primary[500]] as const,
          shadow: theme.colors.primary[400],
          isFinalStrike: false,
        };
    }
  }, [streakRiskLevel, hasActiveSession, isFinalStrike, theme]);
}

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Primary CTA button for starting sessions
 */
export function StartSessionButton({ label, subtitle, resumeTimeSeconds, squadMembersFocusing, streakRiskLevel = "NONE", streakHoursRemaining, isLoading = false, hasActiveSession = false, onPress, testID, bossName, isFinalStrike = false }: StartSessionButtonProps): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const colors = useButtonColors(streakRiskLevel, hasActiveSession, isFinalStrike);

  // Pulsing animation for streak risk
  React.useEffect(() => {
    if (streakRiskLevel === "CRITICAL" || streakRiskLevel === "HIGH") {
      scale.value = withRepeat(withSequence(withSpring(1.02, { damping: 3, stiffness: 150 }), withSpring(1, { damping: 3, stiffness: 150 })), -1, true);
    } else {
      cancelAnimation(scale);
      scale.value = 1;
    }

    return () => {
      cancelAnimation(scale);
    };
  }, [streakRiskLevel, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Compute label text
  // PHASE 7.3: Final Strike mode shows "Defeat [Boss] Now"
  const buttonLabel = useMemo(() => {
    if (label) {
      return label;
    }
    if (hasActiveSession) {
      return "Resume Session";
    }
    if (isFinalStrike && bossName) {
      return `⚔️ Defeat ${bossName} Now`;
    }
    return "Start Focus Session";
  }, [label, hasActiveSession, isFinalStrike, bossName]);

  // Compute subtitle text
  // PHASE 7.3: Final Strike shows urgency message
  const subtitleText = useMemo(() => {
    if (subtitle) {
      return subtitle;
    }
    if (hasActiveSession && resumeTimeSeconds) {
      return `${formatTime(resumeTimeSeconds)} elapsed`;
    }
    // PHASE 7.3: Final Strike takes precedence over other messages
    if (isFinalStrike) {
      return "🔥 Final Strike mode — guaranteed defeat this session!";
    }
    if (squadMembersFocusing && squadMembersFocusing > 0) {
      return `${squadMembersFocusing} squad member${squadMembersFocusing > 1 ? "s" : ""} currently focusing`;
    }
    if (streakRiskLevel === "CRITICAL" && streakHoursRemaining !== null) {
      return `⚠️ ${streakHoursRemaining}h left to save your streak!`;
    }
    if (streakRiskLevel === "HIGH" && streakHoursRemaining !== null) {
      return `⏰ ${streakHoursRemaining} hours remaining`;
    }
    return "Tap to begin your focus session";
  }, [subtitle, hasActiveSession, resumeTimeSeconds, isFinalStrike, squadMembersFocusing, streakRiskLevel, streakHoursRemaining]);

  const isUrgent = streakRiskLevel === "CRITICAL" || streakRiskLevel === "HIGH" || isFinalStrike;

  return (
    <Animated.View style={animatedStyle} testID={testID}>
      <Pressable onPress={onPress} disabled={isLoading} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box
          mx="lg"
          p="lg"
          borderRadius="2xl"
          style={{
            backgroundColor: colors.gradient[0],
          }}
        >
          {/* Gradient background via Box styling */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            borderRadius="2xl"
            style={{
              backgroundColor: colors.gradient[0],
            }}
          />

          {/* Content */}
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flex={1} gap="xs">
              {/* Label */}
              <Box flexDirection="row" alignItems="center" gap="sm">
                {hasActiveSession && <Text fontSize={20}>▶️</Text>}
                {isUrgent && !hasActiveSession && <Text fontSize={20}>🔥</Text>}
                <Text variant="h4" color={theme.colors.text.inverse} fontWeight="700">
                  {buttonLabel}
                </Text>
              </Box>

              {/* Subtitle */}
              <Text variant="bodySmall" color={theme.colors.text.inverse} style={{ opacity: 0.8 }}>
                {subtitleText}
              </Text>
            </Box>

            {/* Right side: Loading or Arrow */}
            {isLoading ? (
              <ActivityIndicator color={theme.colors.text.inverse} />
            ) : (
              <Box width={44} height={44} borderRadius="full" bg={`${theme.colors.text.inverse}20`} justifyContent="center" alignItems="center">
                <Text fontSize={20} color={theme.colors.text.inverse}>
                  {hasActiveSession ? "▶" : "›"}
                </Text>
              </Box>
            )}
          </Box>

          {/* Risk indicator bar for critical states */}
          {isUrgent && !isLoading && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height={3}
              style={{
                backgroundColor: (theme.colors.error as Record<string, string>)[300],
              }}
            />
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Compact version for smaller spaces
 */
export function StartSessionButtonCompact({ onPress, isLoading, streakRiskLevel = "NONE", hasActiveSession = false }: Omit<StartSessionButtonProps, "label" | "subtitle">): JSX.Element {
  const { theme } = useTheme();
  const colors = useButtonColors(streakRiskLevel, hasActiveSession);

  return (
    <Pressable onPress={onPress} disabled={isLoading} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap="sm"
        px="lg"
        py="md"
        borderRadius="xl"
        style={{
          backgroundColor: colors.gradient[0],
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.text.inverse} />
        ) : (
          <>
            <Text fontSize={18}>{hasActiveSession ? "▶️" : "🔥"}</Text>
            <Text variant="body" color={theme.colors.text.inverse} fontWeight="600">
              {hasActiveSession ? "Resume" : "Start Session"}
            </Text>
          </>
        )}
      </Box>
    </Pressable>
  );
}

export default StartSessionButton;
