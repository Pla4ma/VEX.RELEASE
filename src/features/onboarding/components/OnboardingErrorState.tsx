/**
 * Onboarding Error State
 *
 * Error handling for onboarding flow with retry.
 *
 * @phase 2 - Deepening: Error state
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

interface OnboardingErrorStateProps {
  error: Error;
  onRetry: () => void;
  onSkip?: () => void;
}

export function OnboardingErrorState({
  error,
  onRetry,
  onSkip,
}: OnboardingErrorStateProps): JSX.Element {
  const getErrorMessage = (): string => {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("connection")) {
      return "Connection issue. Please check your internet and try again.";
    }
    if (message.includes("timeout")) {
      return "Request timed out. Please retry.";
    }
    if (message.includes("already exists") || message.includes("duplicate")) {
      return "This information is already registered. You can skip onboarding.";
    }

    return "Something went wrong. Please try again.";
  };

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>

        <Text style={styles.title}>Oops!</Text>

        <Text style={styles.message}>{getErrorMessage()}</Text>

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onRetry}
            accessibilityLabel="Try Again button"
            accessibilityRole="button"
            accessibilityHint="Double tap to select"
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>

          {onSkip && (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onSkip}
              accessibilityLabel="Skip for Now button"
              accessibilityRole="button"
              accessibilityHint="Double tap to select"
            >
              <Text style={styles.secondaryButtonText}>Skip for Now</Text>
            </Pressable>
          )}
        </View>

        {/* Debug Info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Error: {error.name}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: launchColors.hex_1a1a2e,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: launchColors.hex_fff,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: launchColors.hex_9e9e9e,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
    maxWidth: 300,
  },
  primaryButton: {
    backgroundColor: launchColors.hex_e94560,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: launchColors.hex_fff,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: launchColors.hex_9e9e9e,
    fontSize: 14,
  },
  debugContainer: {
    marginTop: 32,
    padding: 12,
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: launchColors.hex_666,
  },
});

export default OnboardingErrorState;
