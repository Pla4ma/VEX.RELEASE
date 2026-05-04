/**
 * Comeback Banner Component
 *
 * Special banner for comeback mode with progress and encouragement
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { ComebackPlan } from '../schemas';
import { useTrackComebackSession } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';

export interface ComebackBannerProps {
  plan: ComebackPlan;
  userId: string;
}

export function ComebackBanner({ plan, userId }: ComebackBannerProps): JSX.Element {
  const trackSession = useTrackComebackSession();

  const progress = (plan.sessionsCompleted / plan.targetSessions) * 100;
  const sessionsRemaining = plan.targetSessions - plan.sessionsCompleted;

  const handleSessionComplete = async () => {
    await trackSession.mutateAsync({
      userId,
      sessionCompleted: true,
    });
  };

  return (
    <Animated.View entering={SlideInDown} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🔥</Text>
        <Text style={styles.title}>Comeback Mode Active</Text>
        <Text style={styles.badge}>{plan.bonusMultiplier}x XP</Text>
      </View>

      <Text style={styles.description}>
        Complete {plan.targetSessions} sessions to rebuild your momentum!
        You are getting {plan.bonusMultiplier}x bonus XP.
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {plan.sessionsCompleted}/{plan.targetSessions} sessions
        </Text>
      </View>

      {sessionsRemaining > 0 && (
        <View style={styles.motivation}>
          <Text style={styles.motivationText}>
            {getMotivationMessage(plan.sessionsCompleted, plan.targetSessions)}
          </Text>
        </View>
      )}

      {sessionsRemaining === 0 && (
        <Animated.View entering={FadeIn} style={styles.completeContainer}>
          <Text style={styles.completeText}>🎉 Comeback Complete! 🎉</Text>
          <Text style={styles.completeSubtext}>
            You have successfully rebuilt your habit!
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function getMotivationMessage(completed: number, target: number): string {
  if (completed === 0) {
    return "First step is always the hardest. You've got this!";
  }
  if (completed === 1) {
    return 'One down! The momentum is building.';
  }
  if (completed === target - 1) {
    return 'Almost there! One more session to complete your comeback.';
  }
  const remaining = target - completed;
  return `${remaining} more sessions to go. Keep pushing!`;
}

const styles = createSheet({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#68D391',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  badge: {
    backgroundColor: '#68D391',
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#68D391',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  motivation: {
    backgroundColor: '#F0FFF4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#68D391',
  },
  motivationText: {
    fontSize: 14,
    color: '#276749',
    fontStyle: 'italic',
  },
  completeContainer: {
    backgroundColor: '#F0FFF4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#276749',
    marginBottom: 4,
  },
  completeSubtext: {
    fontSize: 14,
    color: '#68D391',
    textAlign: 'center',
  },
});
