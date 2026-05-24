/**
 * Empty Shop Component
 * Displayed when no items are available
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { ShopCategory } from './shop-types';
import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';


interface EmptyShopProps {
  category: ShopCategory;
  onRefresh: () => void;
}

export function EmptyShop({ category, onRefresh }: EmptyShopProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🛒</Text>
      <Text style={styles.title}>
        {category === 'OFFERS' ? 'No Active Offers' : 'Shop Empty'}
      </Text>
      <Text style={styles.subtitle}>
        {category === 'OFFERS'
          ? 'Flash sales appear when you least expect them. Stay sharp.'
          : 'New inventory arrives daily. Check back — or break a streak to trigger a flash sale.'}
      </Text>
      <Pressable onPress={onRefresh} style={({ pressed }) => [styles.refreshButton, pressed && { opacity: 0.8 }]}
        accessibilityLabel="Refresh button"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
        <Text style={styles.refreshButtonText}>Refresh</Text>
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
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: launchColors.hex_3b82f6,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: launchColors.hex_ffffff,
    fontWeight: '600',
  },
});
