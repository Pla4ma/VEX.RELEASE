/**
 * Currency Display Component
 * Shows user's coin and gem balance
 */

import React from 'react';
import { View, Text } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';

interface CurrencyDisplayProps {
  coins: number;
  gems: number;
  hasSeasonal?: boolean;
}

export function CurrencyDisplay({ coins, gems, hasSeasonal }: CurrencyDisplayProps): React.ReactElement {
  return (
    <View style={styles.currencyBar}>
      <View style={[styles.currencyBadge, { backgroundColor: '#F59E0B' }]}>
        <Text style={styles.currencyIcon}>🪙</Text>
        <Text style={styles.currencyValue}>{coins.toLocaleString()}</Text>
      </View>
      <View style={[styles.currencyBadge, { backgroundColor: '#3B82F6' }]}>
        <Text style={styles.currencyIcon}>💎</Text>
        <Text style={styles.currencyValue}>{gems.toLocaleString()}</Text>
      </View>
      {hasSeasonal && (
        <View style={[styles.currencyBadge, { backgroundColor: '#8B5CF6' }]}>
          <Text style={styles.currencyIcon}>✨</Text>
          <Text style={styles.currencyValue}>Active</Text>
        </View>
      )}
    </View>
  );
}

const styles = createSheet({
  currencyBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  currencyIcon: {
    fontSize: 14,
  },
  currencyValue: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
