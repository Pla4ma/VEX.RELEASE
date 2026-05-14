/**
 * Coach Loading State
 *
 * Loading skeleton for AI Coach.
 *
 * @phase 9 - Deepening: Loading state
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

export function CoachLoadingState(): JSX.Element {
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonName} />
      </View>

      <View style={styles.messageList}>
        <View style={styles.skeletonMessage} />
        <View style={[styles.skeletonMessage, { width: '80%', marginLeft: 40 }]} />
        <View style={styles.skeletonMessage} />
      </View>

      <Text style={styles.loadingText}>Your coach is reviewing your patterns...</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a3e',
    marginRight: 12,
  },
  skeletonName: {
    width: '40%',
    height: 24,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
  },
  messageList: {
    gap: 16,
    flex: 1,
  },
  skeletonMessage: {
    width: '70%',
    height: 60,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 24,
  },
});

export default CoachLoadingState;
