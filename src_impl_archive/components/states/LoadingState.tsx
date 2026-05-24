/**
 * Loading State Component
 *
 * Consistent loading indicator with themed styling.
 *
 * @phase 4
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../primitives';

// ============================================================================
// Types
// ============================================================================

export interface LoadingStateProps {
  /** Optional loading message */
  message?: string;
  /** Size of the spinner */
  size?: 'small' | 'large';
  /** Whether to fill the screen */
  fullScreen?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'large',
  fullScreen = false,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: fullScreen ? 1 : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing[8],
        backgroundColor: fullScreen
          ? theme.colors.background.primary
          : undefined,
      }}
    >
      <ActivityIndicator
        size={size}
        color={theme.colors.primary[500]}
      />

      {message && (
        <Text
          variant="body"
        color="text.secondary"
          style={{
            marginTop: theme.spacing[4],
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

// ============================================================================
// Preset Loading States
// ============================================================================

/** Full screen loading overlay */
export const FullScreenLoader: React.FC<{ message?: string }> = ({
  message,
}) => <LoadingState fullScreen message={message} />;

/** Compact inline loader */
export const InlineLoader: React.FC = () => (
  <LoadingState size="small" />
);
