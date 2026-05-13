/**
 * Session Suggestion Card Component
 *
 * Displays a personalized session recommendation
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SessionRecommendation, RecommendationType } from '../schemas';
import { createSheet } from '@/shared/ui/create-sheet';

export interface SessionSuggestionCardProps {
  recommendation: SessionRecommendation;
  onAccept?: () => void;
  onDismiss?: () => void;
}

const TYPE_CONFIG: Record<RecommendationType, { icon: string; title: string; color: string }> = {
  OPTIMAL_TIME: { icon: '🎯', title: 'Perfect Timing', color: 'theme.colors.primary[500]' },
  STREAK_PROTECTION: { icon: '🔥', title: 'Save Your Streak', color: 'theme.colors.error.DEFAULT' },
  COMEBACK_BUILDER: { icon: '💪', title: 'Comeback Time', color: 'theme.colors.primary[500]' },
  DIFFICULTY_ADJUST: { icon: '⚙️', title: 'Smart Adjustment', color: 'theme.colors.primary[500]' },
  CHALLENGE_SYNC: { icon: '🎮', title: 'Challenge Ready', color: 'theme.colors.primary[500]' },
  BOSS_PREP: { icon: '⚔️', title: 'Boss Battle Prep', color: 'theme.colors.primary[500]' },
  HABIT_BUILDER: { icon: '📅', title: 'Build The Habit', color: 'theme.colors.primary[500]' },
  ENERGY_BASED: { icon: '⚡', title: 'Energy Match', color: 'theme.colors.primary[500]' },
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
    backgroundColor: 'theme.colors.background.primary',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    shadowColor: 'theme.colors.text.primary',
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
    color: 'theme.colors.primary[500]',
  },
  reasoning: {
    fontSize: 15,
    lineHeight: 22,
    color: 'theme.colors.primary[500]',
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'theme.colors.primary[500]',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: 'theme.colors.primary[500]',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'theme.colors.primary[500]',
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
    color: 'theme.colors.background.primary',
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
    color: 'theme.colors.primary[500]',
    fontSize: 16,
    fontWeight: '500',
  },
});
