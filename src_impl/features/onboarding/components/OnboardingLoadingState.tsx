/**
 * Onboarding Loading State
 *
 * Loading skeleton for onboarding flow.
 *
 * @phase 2 - Deepening: Loading state
 */

import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface OnboardingLoadingStateProps {
  step?: string;
}

export function OnboardingLoadingState({ step: _step = 'Loading...' }: OnboardingLoadingStateProps): JSX.Element {
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.content}>
        {/* Skeleton Header */}
        <View style={styles.skeletonTitle} />
        <View style={[styles.skeletonLine, { width: '70%', marginTop: 12 }]} />

        {/* Skeleton Content */}
        <View style={styles.contentContainer}>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </View>

        {/* Skeleton Button */}
        <View style={styles.skeletonButton} />

        <View style={styles.messageContainer}>
          <View style={[styles.skeletonLine, { width: '40%' }]} />
        </View>
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
  skeletonTitle: {
    width: '50%',
    height: 32,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 8,
  },
  skeletonLine: {
    height: 20,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 4,
    width: '90%',
  },
  contentContainer: {
    width: '100%',
    marginTop: 48,
    gap: 16,
  },
  skeletonCard: {
    width: '100%',
    height: 80,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 12,
  },
  skeletonButton: {
    width: '60%',
    height: 48,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 12,
    marginTop: 48,
  },
  messageContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
});

export default OnboardingLoadingState;
