/**
 * Purchase Loading State
 *
 * Loading skeleton for purchase flows.
 *
 * @phase 6 - Deepening: Loading state
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface PurchaseLoadingStateProps {
  productName?: string;
}

export function PurchaseLoadingState({ productName = 'Product' }: PurchaseLoadingStateProps): JSX.Element {
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.content}>
        {/* Skeleton Product Icon */}
        <View style={styles.skeletonIcon} />

        {/* Skeleton Product Name */}
        <View style={styles.skeletonTitle} />

        {/* Skeleton Price */}
        <View style={styles.skeletonPrice} />

        {/* Skeleton Description */}
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '70%' }]} />
        <View style={[styles.skeletonLine, { width: '50%' }]} />

        {/* Skeleton Button */}
        <View style={styles.skeletonButton} />

        <Text style={styles.message}>Loading {productName}...</Text>
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
  skeletonIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'theme.colors.primary[500]',
  },
  skeletonTitle: {
    width: '50%',
    height: 28,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 8,
    marginTop: 24,
  },
  skeletonPrice: {
    width: '30%',
    height: 24,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 8,
    marginTop: 12,
  },
  skeletonLine: {
    width: '90%',
    height: 16,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 4,
    marginTop: 8,
  },
  skeletonButton: {
    width: '80%',
    height: 48,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 12,
    marginTop: 32,
  },
  message: {
    marginTop: 24,
    fontSize: 14,
    color: 'theme.colors.primary[500]',
  },
});

export default PurchaseLoadingState;
