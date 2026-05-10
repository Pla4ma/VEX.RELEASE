/**
 * Empty State Components
 *
 * Premium empty states with illustrations and actions
 */

<<<<<<< HEAD
import React from "react";
import { Text, Pressable } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { createSheet } from "@/shared/ui/create-sheet";
=======
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction, secondaryActionLabel, onSecondaryAction }: EmptyStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <Animated.View entering={FadeInUp.delay(100).duration(400)}>
        <Text style={styles.icon}>{icon}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(400)}>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(400)}>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>

      {(actionLabel || secondaryActionLabel) && (
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.actions}>
          {actionLabel && onAction && (
            <Pressable onPress={onAction} style={styles.primaryButton} accessibilityLabel={actionLabel} accessibilityRole="button" accessibilityHint="Activates this control">
              <Text style={styles.primaryButtonText}>{actionLabel}</Text>
            </Pressable>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Pressable onPress={onSecondaryAction} style={styles.secondaryButton} accessibilityLabel={secondaryActionLabel} accessibilityRole="button" accessibilityHint="Activates this control">
              <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

// Pre-built empty states for common scenarios
export function NoMessagesEmptyState({ onBrowseChallenges }: { onBrowseChallenges?: () => void }) {
  return <EmptyState icon="✉️" title="No Messages Yet" message="Your coach will send personalized messages here based on your activity and progress." actionLabel="Start a Session" onAction={onBrowseChallenges} secondaryActionLabel="Browse Challenges" onSecondaryAction={onBrowseChallenges} />;
}

export function NoHistoryEmptyState() {
  return <EmptyState icon="📜" title="No Message History" message="Complete sessions and build streaks to see your coaching history here." actionLabel="Start First Session" />;
}

export function NoRecommendationsEmptyState({ onViewChallenges }: { onViewChallenges?: () => void }) {
  return <EmptyState icon="🎯" title="No Recommendations" message="We're learning your patterns. Check back soon for personalized session suggestions!" actionLabel="View Challenges" onAction={onViewChallenges} />;
}

export function NoComebackEmptyState() {
  return <EmptyState icon="💪" title="No Active Comeback" message="Your streak is healthy! Comeback mode activates if you break a streak of 3+ days." />;
}

export function MutedStateEmptyState({ onUnmute }: { onUnmute?: () => void }) {
  return <EmptyState icon="🔕" title="Notifications Muted" message="You've muted coach notifications. You can still see messages in the app." actionLabel="Unmute Notifications" onAction={onUnmute} />;
}

export function ErrorStateEmptyState({ error, onRetry }: { error?: string; onRetry?: () => void }) {
  return <EmptyState icon="⚠️" title="Something Went Wrong" message={error || "We couldn't load your coach data. Please try again."} actionLabel="Retry" onAction={onRetry} />;
}

export function OfflineEmptyState({ onRetry }: { onRetry?: () => void }) {
  return <EmptyState icon="📡" title="You're Offline" message="Coach messages will sync when you reconnect. Some features may be limited." actionLabel="Try Again" onAction={onRetry} />;
}

export function NoPersonasEmptyState() {
  return <EmptyState icon="🎭" title="No Coach Personas" message="Loading coach personas..." />;
}

export function ColdStartEmptyState({ onStart }: { onStart?: () => void }) {
  return <EmptyState icon="🌱" title="Welcome to Your Coach" message="Your AI coach learns from your sessions. Complete a few to get personalized guidance!" actionLabel="Start First Session" onAction={onStart} />;
}

const styles = createSheet({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    flex: 1,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 280,
  },
  actions: {
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});
