/**
 * Onboarding Error State
 *
 * Error handling for onboarding flow with retry.
 *
 * @phase 2 - Deepening: Error state
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface OnboardingErrorStateProps {
  error: Error;
  onRetry: () => void;
  onSkip?: () => void;
}

export function OnboardingErrorState({ error, onRetry, onSkip }: OnboardingErrorStateProps): JSX.Element {
  const getErrorMessage = (): string => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('connection')) {
      return 'Connection issue. Please check your internet and try again.';
    }
    if (message.includes('timeout')) {
      return 'Request timed out. Please retry.';
    }
    if (message.includes('already exists') || message.includes('duplicate')) {
      return 'This information is already registered. You can skip onboarding.';
    }

    return 'Something went wrong. Please try again.';
  };

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>

        <Text style={styles.title}>Oops!</Text>

        <Text style={styles.message}>{getErrorMessage()}</Text>

        <View style={styles.buttonContainer}>
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.8 }]} onPress={onRetry}
            accessibilityLabel="Try Again button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>

          {onSkip && (
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.8 }]} onPress={onSkip}
              accessibilityLabel="Skip for Now button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Text style={styles.secondaryButtonText}>Skip for Now</Text>
            </Pressable>
          )}
        </View>

        {/* Debug Info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Error: {error.name}</Text>
        </View>
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
    width: '100%',
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'theme.colors.background.primary',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: 'theme.colors.primary[500]',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    maxWidth: 300,
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'theme.colors.primary[500]',
    fontSize: 14,
  },
  debugContainer: {
    marginTop: 32,
    padding: 12,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: 'theme.colors.primary[500]',
  },
});

export default OnboardingErrorState;
