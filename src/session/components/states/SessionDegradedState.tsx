import React from "react";
import { View, Text, Pressable } from "react-native";
import { styles } from "./SessionDegradedState.styles";

interface DegradedFeature {
  name: string;
  available: boolean;
  reason?: string;
}
interface SessionDegradedStateProps {
  reason: string;
  features: DegradedFeature[];
  onContinueAnyway?: () => void;
  onRetryFullMode?: () => void;
  onEndSession?: () => void;
}
export const SessionDegradedState: React.FC<SessionDegradedStateProps> = ({
  reason,
  features,
  onContinueAnyway,
  onRetryFullMode,
  onEndSession,
}) => {
  const availableCount = features.filter((f) => f.available).length;
  const totalCount = features.length;
  return (
    <View style={styles.container}>
      <View style={styles.warningBanner}>
        <Text style={styles.warningIcon}>⚡</Text>
        <Text style={styles.warningText}>Limited Mode</Text>
      </View>

      <Text style={styles.title}>Session Degraded</Text>
      <Text style={styles.reason}>{reason}</Text>

      {}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>
          Features ({availableCount}/{totalCount} available):
        </Text>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.featureIcon}>
              {feature.available ? "✅" : "❌"}
            </Text>
            <View style={styles.featureInfo}>
              <Text
                style={[
                  styles.featureName,
                  !feature.available && styles.featureUnavailable,
                ]}
              >
                {feature.name}
              </Text>
              {!feature.available && feature.reason && (
                <Text style={styles.featureReason}>{feature.reason}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {}
      <View style={styles.actions}>
        {onRetryFullMode && (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onRetryFullMode}
            accessibilityLabel="🔄 Retry Full Mode button"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={styles.primaryButtonText}>🔄 Retry Full Mode</Text>
          </Pressable>
        )}

        {onContinueAnyway && (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onContinueAnyway}
            accessibilityLabel="Continue in Limited Mode button"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={styles.secondaryButtonText}>
              Continue in Limited Mode
            </Text>
          </Pressable>
        )}

        {onEndSession && (
          <Pressable
            style={({ pressed }) => [
              styles.endButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onEndSession}
            accessibilityLabel="End Session button"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={styles.endButtonText}>End Session</Text>
          </Pressable>
        )}
      </View>

      {}
      <View style={styles.explanation}>
        <Text style={styles.explanationTitle}>What does this mean?</Text>
        <Text style={styles.explanationText}>
          Your session is still running, but some features are temporarily
          unavailable. Your progress is still being tracked and will sync once
          full service is restored.
        </Text>
      </View>
    </View>
  );
};
export default SessionDegradedState;
