/**
 * Session Loading State
 *
 * Skeleton/loading screen for session operations.
 */

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';

interface SessionLoadingStateProps {
  message?: string;
}

export const SessionLoadingState: React.FC<SessionLoadingStateProps> = ({
  message = 'Loading session...',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="theme.colors.primary[500]" />
      <Text style={styles.message}>{message}</Text>

      {/* Skeleton placeholders */}
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonTimer} />
        <View style={styles.skeletonStats}>
          <View style={styles.skeletonStat} />
          <View style={styles.skeletonStat} />
          <View style={styles.skeletonStat} />
        </View>
        <View style={styles.skeletonButton} />
      </View>
    </View>
  );
};

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: 'theme.colors.primary[500]',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: 'theme.colors.primary[500]',
  },
  skeletonContainer: {
    width: '100%',
    marginTop: 40,
    gap: 16,
  },
  skeletonTimer: {
    width: '60%',
    height: 60,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 8,
    alignSelf: 'center',
  },
  skeletonStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  skeletonStat: {
    width: '25%',
    height: 50,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 8,
  },
  skeletonButton: {
    width: '50%',
    height: 48,
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 16,
  },
});

export default SessionLoadingState;
