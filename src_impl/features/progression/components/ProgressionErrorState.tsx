/**
 * Progression Error State
 *
 * Error handling for progression features.
 *
 * @phase 3 - Deepening: Error state
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface ProgressionErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export function ProgressionErrorState({ error, onRetry }: ProgressionErrorStateProps): JSX.Element {
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.title}>Progress Data Blocked</Text>
        <Text style={styles.message}>
          {error.message.includes('network')
            ? "Lost connection. Your journey is safe — we'll resume tracking when you're back."
            : "Boss scrambled the data. We'll recover your progress."}
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

export default ProgressionErrorState;
