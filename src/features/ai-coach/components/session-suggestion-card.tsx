/**
 * Session Suggestion Card Component
 *
 * Displays a personalized session recommendation
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import type { SessionRecommendation } from "../schemas";
import { TYPE_CONFIG, styles } from "./session-suggestion-card-styles";

export { TYPE_CONFIG, styles } from "./session-suggestion-card-styles";

export interface SessionSuggestionCardProps {
  recommendation: SessionRecommendation;
  onAccept?: () => void;
  onDismiss?: () => void;
}

export function SessionSuggestionCard({
  recommendation,
  onAccept,
  onDismiss,
}: SessionSuggestionCardProps): JSX.Element {
  const config = TYPE_CONFIG[recommendation.recommendationType];
  const durationMinutes = Math.round(
    (recommendation.suggestedDuration ?? 15 * 60) / 60,
  );
  const confidence = recommendation.confidence ?? 0;

  return (
    <Animated.View
      entering={FadeInUp}
      style={[styles.container, { borderColor: config.color }]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: config.color }]}>
            {config.title}
          </Text>
          <Text style={styles.confidence}>
            {Math.round(confidence * 100)}% match
          </Text>
        </View>
      </View>

      <Text style={styles.reasoning}>{recommendation.reasoning}</Text>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{durationMinutes} min</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Difficulty</Text>
          <Text style={styles.detailValue}>
            {recommendation.suggestedDifficulty}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onAccept}
          style={[styles.acceptButton, { backgroundColor: config.color }]}
          accessibilityLabel="Start suggested session"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text style={styles.acceptButtonText}>Start Session</Text>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          style={styles.dismissButton}
          accessibilityLabel="Dismiss suggestion"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text style={styles.dismissButtonText}>Not Now</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
