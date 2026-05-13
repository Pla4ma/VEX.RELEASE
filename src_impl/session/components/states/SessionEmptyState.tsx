/**
 * Session Empty State
 *
 * Displayed when no sessions exist yet.
 * Provides CTAs to create first session.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';

interface SessionEmptyStateProps {
  onCreateSession?: () => void;
  onBrowsePresets?: () => void;
}

export const SessionEmptyState: React.FC<SessionEmptyStateProps> = ({
  onCreateSession,
  onBrowsePresets,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎯</Text>
      <Text style={styles.title}>Your First Session Awaits</Text>
      <Text style={styles.description}>
        The first session is the hardest. Everything after that is momentum. Build your streak, defeat bosses, earn rewards.
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.8 }]}
          onPress={onCreateSession}
          accessibilityLabel="Start First Session button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
          <Text style={styles.primaryButtonText}>Start First Session</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.8 }]}
          onPress={onBrowsePresets}
          accessibilityLabel="Browse Presets button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
          <Text style={styles.secondaryButtonText}>Browse Presets</Text>
        </Pressable>
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Pro Tips:</Text>
        <Text style={styles.tip}>• Start with 25-minute Pomodoro sessions</Text>
        <Text style={styles.tip}>• Keep your phone face-down during focus</Text>
        <Text style={styles.tip}>• Build a daily streak for bonus rewards</Text>
      </View>
    </View>
  );
};

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: 'theme.colors.primary[500]',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'theme.colors.background.primary',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'theme.colors.primary[500]',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: 'theme.colors.primary[500]',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'theme.colors.background.primary',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'theme.colors.primary[500]',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'theme.colors.primary[500]',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'theme.colors.background.primary',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: 'theme.colors.primary[500]',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default SessionEmptyState;
