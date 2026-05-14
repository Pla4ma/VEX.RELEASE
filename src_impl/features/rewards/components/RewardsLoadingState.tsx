/**
 * Rewards Loading State
 *
 * Loading skeleton for rewards features.
 *
 * @phase 3 - Deepening: Loading state
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

export function RewardsLoadingState(): JSX.Element {
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
      </View>

      <View style={styles.chestsGrid}>
        <View style={styles.skeletonChest} />
        <View style={styles.skeletonChest} />
        <View style={styles.skeletonChest} />
        <View style={styles.skeletonChest} />
      </View>

      <View style={styles.inventorySection}>
        <View style={styles.skeletonSectionTitle} />
        <View style={styles.skeletonItem} />
        <View style={styles.skeletonItem} />
      </View>

      <Text style={styles.message}>Loading rewards...</Text>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  skeletonTitle: {
    width: '50%',
    height: 32,
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: '70%',
    height: 20,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
  },
  chestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  skeletonChest: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
  },
  inventorySection: {
    gap: 12,
  },
  skeletonSectionTitle: {
    width: '40%',
    height: 24,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonItem: {
    width: '100%',
    height: 60,
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
  },
  message: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 14,
    color: '#9E9E9E',
  },
});

export default RewardsLoadingState;
