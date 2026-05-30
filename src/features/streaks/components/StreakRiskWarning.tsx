/**
 * Streak Risk Warning
 *
 * Alert component for at-risk streaks.
 *
 * @phase 5 - Deepening: Risk warning UI
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

interface StreakRiskWarningProps {
  streak: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  hoursRemaining: number;
  onStartSession: () => void;
  onDismiss?: () => void;
}

export function StreakRiskWarning({
  streak,
  riskLevel,
  hoursRemaining,
  onStartSession,
  onDismiss,
}: StreakRiskWarningProps): JSX.Element {
  const getMessage = () => {
    switch (riskLevel) {
      case "CRITICAL":
        return `Your ${streak}-day streak ends in ${Math.floor(hoursRemaining)} hours!`;
      case "HIGH":
        return `Save your ${streak}-day streak - ${Math.floor(hoursRemaining)} hours left`;
      case "MEDIUM":
        return "Keep your momentum going!";
      default:
        return "Don't forget to focus today";
    }
  };

  const getColor = () => {
    switch (riskLevel) {
      case "CRITICAL":
        return launchColors.hex_f44336;
      case "HIGH":
        return launchColors.hex_ff9800;
      case "MEDIUM":
        return launchColors.hex_ffc107;
      default:
        return launchColors.hex_4caf50;
    }
  };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[styles.container, { borderLeftColor: getColor() }]}
    >
      <View style={styles.content}>
        <Text style={[styles.emoji, { color: getColor() }]}>
          {riskLevel === "CRITICAL" ? "🔥" : riskLevel === "HIGH" ? "⚡" : "💪"}
        </Text>
        <Text style={styles.message}>{getMessage()}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: getColor() },
          pressed && { opacity: 0.8 },
        ]}
        onPress={onStartSession}
        accessibilityLabel="Start Session button"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Text style={styles.buttonText}>Start Session</Text>
      </Pressable>

      {onDismiss && (
        <Pressable
          style={({ pressed }) => [styles.dismiss, pressed && { opacity: 0.8 }]}
          onPress={onDismiss}
          accessibilityLabel="Dismiss button"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text style={styles.dismissText}>Dismiss</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderLeftWidth: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    color: launchColors.hex_fff,
    fontWeight: "600",
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: launchColors.hex_fff,
    fontSize: 16,
    fontWeight: "600",
  },
  dismiss: {
    marginTop: 8,
    alignItems: "center",
  },
  dismissText: {
    color: launchColors.hex_666,
    fontSize: 13,
  },
});

export default StreakRiskWarning;
