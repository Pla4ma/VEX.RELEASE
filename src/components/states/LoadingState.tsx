/**
 * Loading State Component
 *
 * Consistent loading indicator with themed styling.
 *
 * @phase 4
 */

import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../primitives/Text';

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

export const LoadingState: React.ComponentType<LoadingStateProps> = ({
  message,
  size = 'large',
  fullScreen = false,
}) => {
  const { theme } = useTheme();
  const skeletonSize = size === 'large' ? 40 : 20;

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
      <Skeleton width={skeletonSize} height={skeletonSize} variant="circular" />

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

