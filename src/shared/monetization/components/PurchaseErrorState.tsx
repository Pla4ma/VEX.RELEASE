import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
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
}: PurchaseErrorStateProps): React.ReactNode {
  const { theme } = useTheme();

  const getErrorMessage = (): string => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('connection')) {
      return 'VEX lost connection. Your purchase is safe. Try again?';
    }
    if (message.includes('cancel') || message.includes('user cancelled')) {
      return 'Purchase was cancelled. You can try again when ready.';
    }
    if (
      message.includes('already owned') ||
      message.includes('already purchased')
    ) {
      return 'You already own this item. It may take a moment to activate.';
    }
    if (message.includes('insufficient')) {
      return "That purchase didn't go through. Check your payment method and try again.";
    }

    return "That purchase didn't go through. Check your payment method and try again.";
  };

  return (
    <Animated.View
      entering={FadeIn}
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>!</Text>

        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Purchase Failed
        </Text>

        <Text style={[styles.message, { color: theme.colors.text.disabled }]}>
          {getErrorMessage()}
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.colors.semantic.danger },
              pressed && { opacity: 0.8 },
            ]}
            onPress={onRetry}
            accessibilityLabel="Try Again button"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text
              style={[
                styles.primaryButtonText,
                { color: theme.colors.text.inverse },
              ]}
            >
              Try Again
            </Text>
          </Pressable>

          {onCancel && (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onCancel}
              accessibilityLabel="Cancel button"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.colors.text.disabled },
                ]}
              >
                Cancel
              </Text>
            </Pressable>
          )}
        </View>

        <View
          style={[
            styles.infoContainer,
            { backgroundColor: theme.colors.background.secondary },
          ]}
        >
          <Text
            style={[styles.infoText, { color: theme.colors.text.disabled }]}
          >
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
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
  },
  infoContainer: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export { PurchaseErrorState }