import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAnalytics } from "@/shared/analytics";
import { CoachEvents } from "@/shared/analytics/analytics-events";
import type { CoachRecommendation } from "./coach-chat-types";
import { styles } from "./CoachScreen.styles";

interface CoachRecommendationCardProps {
  recommendation: CoachRecommendation;
}

export function CoachRecommendationCard({
  recommendation,
}: CoachRecommendationCardProps): JSX.Element {
  const { track } = useAnalytics();

  return (
    <View style={styles.recommendationCard}>
      <Text style={styles.recommendationTitle}>Recommended Session</Text>
      <Text style={styles.recommendationReason}>
        {recommendation.reasoning}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.startSessionButton,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => {
          track(CoachEvents.COACH_CTA_CLICKED, {
            duration: recommendation.duration,
            difficulty: recommendation.difficulty,
            source: "coach_recommendation",
          });
        }}
        accessibilityLabel="Start session button"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <Text style={styles.startSessionButtonText}>
          Start {recommendation.duration}-min Session
        </Text>
      </Pressable>
    </View>
  );
}
