/**
 * Squad Error State
 *
 * Error handling for squad features.
 *
 * @phase 4 - Deepening: Error state
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface SquadErrorStateProps {
  error: Error;
  onRetry: () => void;
  onLeaveSquad?: () => void;
}

export function SquadErrorState({ error, onRetry, onLeaveSquad }: SquadErrorStateProps): JSX.Element {
  const getErrorMessage = (): string => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('connection')) {
      return 'Connection issue. Please check your internet and try again.';
    }
    if (message.includes('not found')) {
      return 'Squad not found. It may have been disbanded.';
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'You do not have permission to access this squad.';
    }

    return 'Unable to load squad data. Please try again.';
  };

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>👥</Text>
        <Text style={styles.title}>Squad Unavailable</Text>
        <Text style={styles.message}>{getErrorMessage()}</Text>

        <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={onRetry}
          accessibilityLabel="Try Again button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>

        {onLeaveSquad && (
          <Pressable style={({ pressed }) => [styles.leaveButton, pressed && { opacity: 0.8 }]} onPress={onLeaveSquad}
            accessibilityLabel="Leave Squad button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
            <Text style={styles.leaveButtonText}>Leave Squad</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
    color: '#fff',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#e94560',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  leaveButtonText: {
    color: '#f44336',
    fontSize: 14,
  },
});

export default SquadErrorState;
