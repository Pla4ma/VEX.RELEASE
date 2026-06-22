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
import { lightColors } from '@/theme/tokens/colors';


interface PurchaseLoadingStateProps {
  productName?: string;
}

export function PurchaseLoadingState({
  productName = 'Product',
}: PurchaseLoadingStateProps): React.ReactNode {
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
    backgroundColor: lightColors.semantic.background,
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
    backgroundColor: lightColors.semantic.backgroundElevated,
  },
  skeletonTitle: {
    width: '50%',
    height: 28,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 8,
    marginTop: 24,
  },
  skeletonPrice: {
    width: '30%',
    height: 24,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 8,
    marginTop: 12,
  },
  skeletonLine: {
    width: '90%',
    height: 16,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 4,
    marginTop: 8,
  },
  skeletonButton: {
    width: '80%',
    height: 48,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 12,
    marginTop: 32,
  },
  message: {
    marginTop: 24,
    fontSize: 14,
    color: lightColors.text.muted,
  },
});
