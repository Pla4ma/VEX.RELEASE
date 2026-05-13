/**
 * Purchase Error State
 *
 * Error handling for purchase flows with retry.
 *
 * @phase 6 - Deepening: Error state
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface PurchaseErrorStateProps {
  error: Error;
  onRetry: () => void;
  onCancel?: () => void;
  productName?: string;
}

export function PurchaseErrorState({
  error,
  onRetry,
  onCancel,
}: PurchaseErrorStateProps): JSX.Element {
  const getErrorMessage = (): string => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('connection')) {
      return 'VEX lost connection. Your purchase is safe. Try again?';
    }
    if (message.includes('cancel') || message.includes('user cancelled')) {
      return 'Purchase was cancelled. You can try again when ready.';
    }
    if (message.includes('already owned') || message.includes('already purchased')) {
      return 'You already own this item. It may take a moment to activate.';
    }
    if (message.includes('insufficient')) {
      return "That purchase didn't go through. Check your payment method and try again.";
    }

    return "That purchase didn't go through. Check your payment method and try again.";
  };

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>

        <Text style={styles.title}>Purchase Failed</Text>

        <Text style={styles.message}>{getErrorMessage()}</Text>

        <View style={styles.buttonContainer}>
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.8 }]} onPress={onRetry}
            accessibilityLabel="Try Again button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>

          {onCancel && (
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.8 }]} onPress={onCancel}
              accessibilityLabel="Cancel button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          )}
        </View>

        {/* Receipt Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            If you were charged, your items will be restored automatically.
          </Text>
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
  infoContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 12,
    width: '100%',
  },
  infoText: {
    fontSize: 13,
    color: 'theme.colors.primary[500]',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PurchaseErrorState;
