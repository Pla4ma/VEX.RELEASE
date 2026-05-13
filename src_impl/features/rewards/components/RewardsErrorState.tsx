/**
 * Rewards Error State
 *
 * Error handling for rewards features.
 *
 * @phase 3 - Deepening: Error state
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface RewardsErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export function RewardsErrorState({ error, onRetry }: RewardsErrorStateProps): JSX.Element {
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🎁</Text>
        <Text style={styles.title}>Boss Raid on Rewards</Text>
        <Text style={styles.message}>
          {error.message.includes('network')
            ? "Connection dropped. Your rewards are safe — we'll retry when you're back."
            : "Boss interference detected. We'll get your rewards back."}
        </Text>

        <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={onRetry}
          accessibilityLabel="Try Again button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: 'theme.colors.primary[500]',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'theme.colors.background.primary',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: 'theme.colors.primary[500]',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: 'theme.colors.primary[500]',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'theme.colors.background.primary',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RewardsErrorState;
