/**
 * Currency Display Component
 * Shows user's coin and gem balance
 */

import React from 'react';
import { View, Text } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';


interface CurrencyDisplayProps {
  coins: number;
  gems: number;
  hasSeasonal?: boolean;
}

export function CurrencyDisplay({ coins, gems, hasSeasonal }: CurrencyDisplayProps): React.ReactElement {
  return (
    <View style={styles.currencyBar}>
      <View style={[styles.currencyBadge, { backgroundColor: launchColors.hex_f59e0b }]}>
        <Text style={styles.currencyIcon}>🪙</Text>
        <Text style={styles.currencyValue}>{coins.toLocaleString()}</Text>
      </View>
      <View style={[styles.currencyBadge, { backgroundColor: launchColors.hex_3b82f6 }]}>
        <Text style={styles.currencyIcon}>💎</Text>
        <Text style={styles.currencyValue}>{gems.toLocaleString()}</Text>
      </View>
      {hasSeasonal && (
        <View style={[styles.currencyBadge, { backgroundColor: launchColors.hex_8b5cf6 }]}>
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
    color: launchColors.hex_ffffff,
    fontWeight: '600',
    fontSize: 14,
  },
});
