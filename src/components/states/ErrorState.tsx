/**
 * ErrorState Component
 *
 * Display for error states with retry functionality.
 */

import React from 'react';
import { type ViewStyle } from 'react-native';
import { lightColors } from '@/theme/tokens/colors';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../primitives/Box';
import { Button } from '../primitives/Button';
import { Text } from '../primitives/Text';
import { Icon } from '../../icons/components/Icon';

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
        
export const ErrorState: React.ComponentType<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'We ran into an issue. Please try again.',
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
      style={Object.assign(
        {},
        {
          backgroundColor:
            theme?.colors?.semantic?.background || lightColors.semantic.backgroundMuted,
        },
        style,
      )}
    >
      {/* Error Icon */}
      <Box mb="lg">
        <Box
          style={{
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor:
  theme?.colors?.semantic?.vexCyanSoft ||
  rgbaColors.rgb_0_229_255_0_08,
  borderColor:
  theme?.colors?.semantic?.vexCyan || lightColors.semantic.vexCyan,
  borderWidth: 1,
  alignItems: 'center',
  justifyContent: 'center',
}}
        >
          <Icon
            name="x-circle"
            size={28}
            color={theme?.colors?.semantic?.vexCyan || lightColors.semantic.vexCyan}
            variant="outline"
          />
        </Box>
      </Box>

      {/* Title */}
      <Text
        variant="h3"
        mb="md"
        textAlign="center"
        style={{
          color: theme?.colors?.text?.primary || lightColors.semantic.backgroundMuted,
        }}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        variant="body"
        mb="lg"
        textAlign="center"
        style={{
          color: theme?.colors?.text?.secondary || lightColors.text.secondary,
          maxWidth: 300,
        }}
      >
        {description}
      </Text>

      {/* Error Code */}
      {errorCode && (
        <Box
          mb="lg"
          p="sm"
          style={{
            backgroundColor:
              theme?.colors?.semantic?.surfaceGlass ||
              'rgba(255,255,255,0.86)',
            borderRadius: theme?.borderRadius?.md || 8,
          }}
        >
          <Text
            variant="caption"
            style={{
              color: theme?.colors?.text?.tertiary || lightColors.text.tertiary,
              fontFamily: 'monospace',
            }}
          >
            Error: {errorCode}
          </Text>
        </Box>
      )}

      {/* Actions */}
      <Box
        flexDirection="column"
        style={{ gap: theme?.spacing?.[3] || 12, width: '100%', maxWidth: 300 }}
      >
        {onRetry && (
          <Button
            accessibilityHint="Retries loading this content"
            accessibilityLabel={retryLabel}
            accessibilityRole="button"
            onPress={onRetry}
            variant="primary"
          >
            {retryLabel}
          </Button>
        )}
        {onDegraded && (
          <Button
            accessibilityHint="Continues with limited functionality"
            accessibilityLabel={degradedLabel}
            accessibilityRole="button"
            onPress={onDegraded}
            variant="ghost"
          >
            {degradedLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};
