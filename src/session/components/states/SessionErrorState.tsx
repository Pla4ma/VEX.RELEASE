import React from "react";
import { View, Text, Pressable } from "react-native";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";
interface SessionErrorStateProps {
  error: Error;
  onRetry?: () => void;
  onGoBack?: () => void;
  onContactSupport?: () => void;
}
export const SessionErrorState: React.FC<SessionErrorStateProps> = ({
  error,
  onRetry,
  onGoBack,
  onContactSupport,
}) => {
  const getErrorMessage = (err: Error): string => {
    const message = err.message.toLowerCase();
    if (message.includes("network")) {
      return "VEX lost connection. Your session is saved. Try again?";
    }
    if (message.includes("timeout")) {
      return "Couldn't start your session. Boss must have tampered with the servers.";
    }
    if (message.includes("permission") || message.includes("unauthorized")) {
      return "Session expired. Log back in and your progress is safe.";
    }
    if (message.includes("not found")) {
      return "Session not found. It may have been claimed by the void.";
    }
    if (message.includes("sync") || message.includes("conflict")) {
      return "Session sync failed. Your focus data is safe, but we need to resolve a conflict.";
    }
    return "Something went wrong. The boss is interfering with our systems.";
  };
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Boss Interference!</Text>
      <Text style={styles.message}>{getErrorMessage(error)}</Text>

      {}
      <View style={styles.errorDetails}>
        <Text style={styles.errorCode}>Error: {error.name}</Text>
        <Text style={styles.errorHint}>{error.message}</Text>
      </View>

      <View style={styles.actions}>
        {onRetry && (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onRetry}
            accessibilityLabel="🔄 Try Again button"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={styles.primaryButtonText}>🔄 Try Again</Text>
          </Pressable>
        )}

        {onGoBack && (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onGoBack}
            accessibilityLabel="← Go Back button"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={styles.secondaryButtonText}>← Go Back</Text>
          </Pressable>
        )}

        {onContactSupport && (
          <Pressable
            style={({ pressed }) => [
              styles.supportButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onContactSupport}
            accessibilityLabel="Contact Support button"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </Pressable>
        )}
      </View>

      {}
      <View style={styles.recoveryInfo}>
        <Text style={styles.recoveryTitle}>Your Progress is Safe</Text>
        <Text style={styles.recoveryText}>
          Your session data is protected. Any focus time will be restored once
          we fight off this server boss.
        </Text>
      </View>
    </View>
  );
};
const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: launchColors.hex_1a1a2e,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  icon: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: launchColors.hex_e94560,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: launchColors.hex_fff,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: "100%",
  },
  errorCode: {
    fontSize: 12,
    color: launchColors.hex_f44336,
    fontWeight: "600",
  },
  errorHint: { fontSize: 12, color: launchColors.hex_9e9e9e, marginTop: 4 },
  actions: { width: "100%", gap: 12, marginBottom: 32 },
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
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: launchColors.hex_9e9e9e,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: launchColors.hex_9e9e9e,
    fontSize: 16,
    fontWeight: "600",
  },
  supportButton: { paddingVertical: 12, alignItems: "center" },
  supportButtonText: { color: launchColors.hex_666, fontSize: 14 },
  recoveryInfo: {
    backgroundColor: launchColors.rgb_76_175_80_0_1,
    borderRadius: 12,
    padding: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: launchColors.rgb_76_175_80_0_3,
  },
  recoveryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: launchColors.hex_4caf50,
    marginBottom: 4,
  },
  recoveryText: {
    fontSize: 13,
    color: launchColors.hex_9e9e9e,
    lineHeight: 18,
  },
});
export default SessionErrorState;
