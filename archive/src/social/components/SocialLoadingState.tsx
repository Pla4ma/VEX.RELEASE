/**
 * Social System - Loading State Component
 *
 * Premium loading state for social feed.
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '../../components/primitives';
import { useTheme } from '../../theme';
import { createSheet } from '@/shared/ui/create-sheet';

interface SocialLoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const SocialLoadingState: React.FC<SocialLoadingStateProps> = ({
  message = 'Loading your social feed...',
  fullScreen = false,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      <Text
        variant="body"
        style={[styles.message, { color: theme.colors.text.secondary }]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = createSheet({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  fullScreen: {
    flex: 1,
    minHeight: 400,
  },
  message: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default SocialLoadingState;
