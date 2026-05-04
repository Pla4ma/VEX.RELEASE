/**
 * Session Suggestion Card Component
 *
 * Displays a personalized session recommendation
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SessionRecommendation, RecommendationType } from '../schemas';
import { createSheet } from '@/shared/ui/create-sheet';

export interface SessionSuggestionCardProps {
  recommendation: SessionRecommendation;
  onAccept?: () => void;
  onDismiss?: () => void;
}

const TYPE_CONFIG: Record<RecommendationType, { icon: string; title: string; color: string }> = {
  OPTIMAL_TIME: { icon: '🎯', title: 'Perfect Timing', color: '#4ECDC4' },
  STREAK_PROTECTION: { icon: '🔥', title: 'Save Your Streak', color: '#FC8181' },
  COMEBACK_BUILDER: { icon: '💪', title: 'Comeback Time', color: '#68D391' },
  DIFFICULTY_ADJUST: { icon: '⚙️', title: 'Smart Adjustment', color: '#A0AEC0' },
  CHALLENGE_SYNC: { icon: '🎮', title: 'Challenge Ready', color: '#F6AD55' },
  BOSS_PREP: { icon: '⚔️', title: 'Boss Battle Prep', color: '#9F7AEA' },
  HABIT_BUILDER: { icon: '📅', title: 'Build The Habit', color: '#63B3ED' },
  ENERGY_BASED: { icon: '⚡', title: 'Energy Match', color: '#F6E05E' },
};

export function SessionSuggestionCard({
  recommendation,
  onAccept,
  onDismiss,
}: SessionSuggestionCardProps): JSX.Element {
  const config = TYPE_CONFIG[recommendation.recommendationType];
  const durationMinutes = Math.round((recommendation.suggestedDuration ?? 15 * 60) / 60);
  const confidence = recommendation.confidence ?? 0;

  return (
    <Animated.View entering={FadeInUp} style={[styles.container, { borderColor: config.color }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: config.color }]}>{config.title}</Text>
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
          <Text style={styles.detailValue}>{recommendation.suggestedDifficulty}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onAccept}
          style={[styles.acceptButton, { backgroundColor: config.color }]}
          accessibilityLabel="Start suggested session"

        accessibilityRole="button"
        accessibilityHint="Activates this control">
          <Text style={styles.acceptButtonText}>Start Session</Text>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          style={styles.dismissButton}
          accessibilityLabel="Dismiss suggestion"

        accessibilityRole="button"
        accessibilityHint="Activates this control">
          <Text style={styles.dismissButtonText}>Not Now</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  confidence: {
    fontSize: 12,
    color: '#666',
  },
  reasoning: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  dismissButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});
