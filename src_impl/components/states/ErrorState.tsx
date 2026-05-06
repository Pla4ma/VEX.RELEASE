/**
 * ErrorState Component
 *
 * Display for error states with retry functionality.
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme';
import { Box, Text } from '../primitives';
import { Button } from '../primitives';

/**
 * ErrorState props
 */
export interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Error code/category */
  errorCode?: string;
  /** Retry button text */
  retryLabel?: string;
  /** Retry button handler */
  onRetry?: () => void;
  /** Degraded mode button text */
  degradedLabel?: string;
  /** Degraded mode handler */
  onDegraded?: () => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * ErrorState component
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Boss Interference Detected',
  description = 'Something disrupted your focus flow. Try again and show that boss who\'s in control.',
  errorCode,
  retryLabel = 'Try Again',
  onRetry,
  degradedLabel = 'Continue Anyway',
  onDegraded,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      p="xl"
      testID={testID}
      style={Object.assign({}, { backgroundColor: theme.colors.background.primary }, style)}
    >
      {/* Error Icon - X in circle per spec */}
      <Box mb="lg">
        <Box
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.colors.error.DEFAULT + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="h1" style={{ fontSize: 32, color: theme.colors.error.DEFAULT }}>
            ✕
          </Text>
        </Box>
      </Box>

      {/* Title */}
      <Text
        variant="h3"
        mb="md"
        textAlign="center"
        style={{ color: theme.colors.text.primary }}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        variant="body"
        mb="lg"
        textAlign="center"
        style={{ color: theme.colors.text.secondary, maxWidth: 300 }}
      >
        {description}
      </Text>

      {/* Error Code */}
      {errorCode && (
        <Box
          mb="lg"
          p="sm"
          style={{
            backgroundColor: theme.colors.background.secondary,
            borderRadius: 8,
          }}
        >
          <Text
            variant="caption"
            style={{
              color: theme.colors.text.tertiary,
              fontFamily: 'monospace',
            }}
          >
            Error: {errorCode}
          </Text>
        </Box>
      )}

      {/* Actions */}
      <Box flexDirection="column" style={{ gap: 12, width: '100%', maxWidth: 300 }}>
        {onRetry && (
          <Button variant="primary" onPress={onRetry}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            {retryLabel}
          </Button>
        )}
        {onDegraded && (
          <Button variant="ghost" onPress={onDegraded}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            {degradedLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ErrorState;
