/**
 * Session Loading State
 *
 * Skeleton/loading screen for session operations.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';
import { createSheet } from '@/shared/ui/create-sheet';
import { useTheme } from '../../../theme/ThemeContext';

interface SessionLoadingStateProps {
  message?: string;
}

export const SessionLoadingState: React.ComponentType<SessionLoadingStateProps> = ({
  message = 'Loading session...',
}) => {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;

  return (
    <View style={[styles.container, { backgroundColor: semantic.background }]}>
      <Skeleton width={40} height={40} variant="circular" />
      <Text style={[styles.message, { color: semantic.textMuted }]}>{message}</Text>

      {/* Skeleton placeholders */}
      <View style={styles.skeletonContainer}>
        <View style={[styles.skeletonTimer, { backgroundColor: semantic.surfaceElevated }]} />
        <View style={styles.skeletonStats}>
          <View style={[styles.skeletonStat, { backgroundColor: semantic.surfaceElevated }]} />
          <View style={[styles.skeletonStat, { backgroundColor: semantic.surfaceElevated }]} />
          <View style={[styles.skeletonStat, { backgroundColor: semantic.surfaceElevated }]} />
        </View>
        <View style={[styles.skeletonButton, { backgroundColor: semantic.surfaceElevated }]} />
      </View>
    </View>
  );
};

const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
  },
  skeletonContainer: {
    width: '100%',
    marginTop: 40,
    gap: 16,
  },
  skeletonTimer: {
    width: '60%',
    height: 60,
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
    borderRadius: 8,
  },
  skeletonButton: {
    width: '50%',
    height: 48,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 16,
  },
});
