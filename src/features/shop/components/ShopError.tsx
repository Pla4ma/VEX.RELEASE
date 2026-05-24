/**
 * Shop Error Component
 * Error state for the shop screen
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';


interface ShopErrorProps {
  error: Error;
  onRetry: () => void;
}

export function ShopError({ error, onRetry }: ShopErrorProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Failed to Load Shop</Text>
      <Text style={styles.subtitle}>{error.message}</Text>
      <Pressable onPress={onRetry} style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.8 }]}
        accessibilityLabel="Try Again button"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
        <Text style={styles.retryButtonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: launchColors.hex_6b7280,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: launchColors.hex_3b82f6,
    borderRadius: 8,
  },
  retryButtonText: {
    color: launchColors.hex_ffffff,
    fontWeight: '600',
  },
});
