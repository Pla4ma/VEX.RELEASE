/**
 * Progression Loading State
 *
 * Loading skeleton for progression features.
 *
 * @phase 3 - Deepening: Loading state
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

export function ProgressionLoadingState(): JSX.Element {
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.skeletonLevel} />
        <View style={styles.skeletonXP} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.skeletonStat} />
        <View style={styles.skeletonStat} />
        <View style={styles.skeletonStat} />
      </View>

      <View style={styles.rewardsSection}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonReward} />
        <View style={styles.skeletonReward} />
      </View>

      <Text style={styles.message}>Loading progression...</Text>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: 'theme.colors.primary[500]',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  skeletonLevel: {
    width: 120,
    height: 40,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 8,
    marginBottom: 16,
  },
  skeletonXP: {
    width: '60%',
    height: 20,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  skeletonStat: {
    width: '30%',
    height: 60,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 8,
  },
  rewardsSection: {
    gap: 12,
  },
  skeletonTitle: {
    width: '40%',
    height: 24,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonReward: {
    width: '100%',
    height: 80,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 12,
  },
  message: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 14,
    color: 'theme.colors.primary[500]',
  },
});

export default ProgressionLoadingState;
