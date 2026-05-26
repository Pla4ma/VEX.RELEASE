/**
 * Shop Skeleton Component
 * Loading skeleton for the shop screen
 */

import React from 'react';
import { View } from 'react-native';
import { CATEGORIES } from './shop-constants';
import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';


export function ShopSkeleton(): React.ReactElement {
  return (
    <View style={styles.container}>
      <View style={styles.currencyBar}>
        {[1, 2].map(i => (
          <View key={i} style={[styles.currencyBadge, styles.skeleton]}>
            <View style={styles.skeletonText} />
          </View>
        ))}
      </View>

      <View style={styles.categoryBar}>
        {CATEGORIES.map((_, i) => (
          <View key={i} style={[styles.categoryButton, styles.skeleton]} />
        ))}
      </View>

      <View style={styles.grid}>
        {Array(9).fill(null).map((_, i) => (
          <View key={i} style={[styles.itemCard, styles.skeleton]} />
        ))}
      </View>
    </View>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
  },
  currencyBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  currencyBadge: {
    width: 80,
    height: 32,
    borderRadius: 16,
  },
  categoryBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    width: 80,
    height: 36,
    borderRadius: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  itemCard: {
    width: '30%',
    aspectRatio: 0.8,
    borderRadius: 12,
  },
  skeleton: {
    backgroundColor: launchColors.hex_e5e7eb,
  },
  skeletonText: {
    width: '60%',
    height: 12,
    backgroundColor: launchColors.hex_d1d5db,
    borderRadius: 4,
    marginTop: 8,
  },
});
