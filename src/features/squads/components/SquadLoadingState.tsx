/**
 * Squad Loading State
 *
 * Loading skeleton for squad features.
 *
 * @phase 4 - Deepening: Loading state
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

export function SquadLoadingState(): JSX.Element {
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      {/* Squad Header Skeleton */}
      <View style={styles.header}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonName} />
        <View style={styles.skeletonStat} />
      </View>

      {/* Members List Skeleton */}
      <View style={styles.membersSection}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonMember} />
        <View style={styles.skeletonMember} />
        <View style={styles.skeletonMember} />
      </View>

      <Text style={styles.message}>Loading squad...</Text>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  skeletonAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a3e',
    marginBottom: 16,
  },
  skeletonName: {
    width: '50%',
    height: 28,
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonStat: {
    width: '30%',
    height: 20,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
  },
  membersSection: {
    gap: 12,
  },
  skeletonTitle: {
    width: '40%',
    height: 24,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonMember: {
    width: '100%',
    height: 60,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
  },
  message: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 14,
    color: '#9E9E9E',
  },
});

export default SquadLoadingState;
