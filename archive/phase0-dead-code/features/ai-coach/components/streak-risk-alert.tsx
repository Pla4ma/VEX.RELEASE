/**
 * Streak Risk Alert Component
 *
 * Urgent alert when streak is at risk
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useCoachMessageActions } from '../hooks';
import { CoachMessage } from '../schemas';
import { createSheet } from '@/shared/ui/create-sheet';

export interface StreakRiskAlertProps {
  message: CoachMessage;
  userId: string;
  currentStreak: number;
  hoursRemaining: number;
  onDismiss?: () => void;
}

export function StreakRiskAlert({
  message,
  userId,
  currentStreak,
  hoursRemaining,
  onDismiss,
}: StreakRiskAlertProps): JSX.Element {
  const { dismiss, takeAction, isProcessing } = useCoachMessageActions(message.id, userId);

  const handleQuickSession = async () => {
    await takeAction('QUICK_SESSION');
  };

  const handleDismiss = async () => {
    await dismiss();
    onDismiss?.();
  };

  const getUrgencyColor = () => {
    if (hoursRemaining <= 4) {return '#E74C3C';}
    if (hoursRemaining <= 8) {return '#F39C12';}
    return '#F1C40F';
  };

  return (
    <Animated.View entering={FadeIn} style={styles.overlay}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={handleDismiss}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control"/>
      </View>

      <Animated.View entering={ZoomIn.springify()} style={styles.container}>
        <View style={[styles.flameContainer, { backgroundColor: getUrgencyColor() }]}>
          <Text style={styles.flameIcon}>🔥</Text>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Your Streak is at Risk!</Text>

          <Text style={styles.message}>{message.content}</Text>

          <View style={styles.timeIndicator}>
            <Text style={[styles.timeText, { color: getUrgencyColor() }]}>
              ⏰ {hoursRemaining} hours remaining
            </Text>
          </View>

          <Pressable
            onPress={handleQuickSession}
            disabled={isProcessing}
            style={[styles.actionButton, { backgroundColor: getUrgencyColor() }]}
            accessibilityLabel="Start quick session to save streak"

          accessibilityRole="button"
          accessibilityHint="Activates this control">
            <Text style={styles.actionButtonText}>Start Quick Session (15 min)</Text>
          </Pressable>

          <Pressable
            onPress={handleDismiss}
            disabled={isProcessing}
            style={styles.dismissButton}
            accessibilityLabel="Dismiss alert"

          accessibilityRole="button"
          accessibilityHint="Activates this control">
            <Text style={styles.dismissButtonText}>I'll do it later</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = createSheet({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdropPressable: {
    flex: 1,
  },
  container: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  flameContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  flameIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFF',
  },
  streakLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  timeIndicator: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dismissButton: {
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  dismissButtonText: {
    color: '#999',
    fontSize: 14,
  },
});
