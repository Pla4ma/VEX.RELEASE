/**
 * Combat Error State
 * 
 * Error state component for combat system failures.
 * Provides error information, recovery options, and retry mechanisms.
 */

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Box, Button } from '../../components/primitives';
import { Icon } from '../../icons';

interface CombatErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  onReset?: () => void;
  onReport?: () => void;
  onSkip?: () => void;
  variant?: 'network' | 'system' | 'validation' | 'recovery';
  retryCount?: number;
  maxRetries?: number;
}

export const CombatErrorState: React.FC<CombatErrorStateProps> = ({
  error,
  onRetry,
  onReset,
  onReport,
  onSkip,
  variant = 'system',
  retryCount = 0,
  maxRetries = 3,
}) => {
  const { theme } = useTheme();

  const getErrorContent = () => {
    const errorMessage = typeof error === 'string' ? error : error.message;

    switch (variant) {
      case 'network':
        return {
          icon: 'wifi-off',
          iconColor: theme.colors.error.DEFAULT,
          title: 'Connection Error',
          description: 'Unable to connect to the combat server. Please check your internet connection.',
          details: errorMessage,
          primaryAction: onRetry && retryCount < maxRetries ? onRetry : onReset,
          primaryText: onRetry && retryCount < maxRetries ? 'Retry' : 'Reset Session',
          secondaryAction: onSkip,
          secondaryText: 'Skip Combat',
          showRetryCount: true,
        };
      case 'system':
        return {
          icon: 'alert-triangle',
          iconColor: theme.colors.warning.DEFAULT,
          title: 'System Error',
          description: 'The combat system encountered an unexpected error.',
          details: errorMessage,
          primaryAction: onRetry && retryCount < maxRetries ? onRetry : onReset,
          primaryText: onRetry && retryCount < maxRetries ? 'Retry' : 'Reset Session',
          secondaryAction: onReport,
          secondaryText: 'Report Issue',
          showRetryCount: true,
        };
      case 'validation':
        return {
          icon: 'check-circle',
          iconColor: theme.colors.warning.DEFAULT,
          title: 'Validation Error',
          description: 'Invalid combat data detected. The session will be reset to prevent data corruption.',
          details: errorMessage,
          primaryAction: onReset,
          primaryText: 'Reset Session',
          secondaryAction: onSkip,
          secondaryText: 'Skip Combat',
          showRetryCount: false,
        };
      case 'recovery':
        return {
          icon: 'refresh-cw',
          iconColor: theme.colors.info.DEFAULT,
          title: 'Recovery Mode',
          description: 'Combat system is recovering from an error. Your progress has been saved.',
          details: errorMessage,
          primaryAction: onRetry,
          primaryText: 'Continue Recovery',
          secondaryAction: onReset,
          secondaryText: 'Start Fresh',
          showRetryCount: true,
        };
      default:
        return {
          icon: 'alert-triangle',
          iconColor: theme.colors.error.DEFAULT,
          title: 'Unknown Error',
          description: 'An unexpected error occurred in the combat system.',
          details: errorMessage,
          primaryAction: onReset,
          primaryText: 'Reset Session',
          secondaryAction: onReport,
          secondaryText: 'Report Issue',
          showRetryCount: false,
        };
    }
  };

  const content = getErrorContent();

  return (
    <Box
      flex={1}
      bg="background.secondary"
      justifyContent="center"
      alignItems="center"
      p="lg"
    >
      <Animated.View entering={BounceIn.duration(600)}>
        <Box alignItems="center" maxWidth={400}>
          {/* Error Icon */}
          <Box
            width={80}
            height={80}
            borderRadius={40}
            bg={`${content.iconColor}20`}
            justifyContent="center"
            alignItems="center"
            mb="lg"
          >
            <Icon
              name={content.icon}
              size={40}
              color={content.iconColor}
            />
          </Box>

          {/* Error Title */}
          <Text
            variant="h3"
            color="text.primary"
            textAlign="center"
            mb="md"
          >
            {content.title}
          </Text>

          {/* Error Description */}
          <Text
            variant="body"
            color="text.secondary"
            textAlign="center"
            mb="lg"
            lineHeight={20}
          >
            {content.description}
          </Text>

          {/* Error Details */}
          <Box
            bg="background.primary"
            p="md"
            borderRadius={8}
            mb="lg"
            width="100%"
          >
            <Text
              variant="caption"
              color="text.tertiary"
              mb="xs"
            >
              Error Details
            </Text>
            <Text
              variant="caption"
              color="text.secondary"
              fontFamily="monospace"
              numberOfLines={3}
            >
              {content.details}
            </Text>
          </Box>

          {/* Retry Count */}
          {content.showRetryCount && retryCount > 0 && (
            <Box mb="lg">
              <Text
                variant="caption"
                color="text.tertiary"
                textAlign="center"
              >
                Retry attempt {retryCount} of {maxRetries}
              </Text>
            </Box>
          )}

          {/* Action Buttons */}
          <Box gap="sm" width="100%">
            <Button
              variant="primary"
              size="lg"
              onPress={content.primaryAction}
              style={{ width: '100%' }}
            >
              {content.primaryText}
            </Button>

            {content.secondaryAction && (
              <Button
                variant="secondary"
                size="md"
                onPress={content.secondaryAction}
                style={{ width: '100%' }}
              >
                {content.secondaryText}
              </Button>
            )}
          </Box>

          {/* Help Section */}
          <Animated.View entering={FadeIn.delay(800)}>
            <Box
              bg="background.primary"
              p="md"
              borderRadius={12}
              mt="xl"
              width="100%"
            >
              <Box flexDirection="row" alignItems="center" mb="xs">
                <Icon
                  name="help-circle"
                  size={16}
                  color={theme.colors.text.tertiary}
                  mr="xs"
                />
                <Text
                  variant="bodySmall"
                  color="text.tertiary"
                  fontWeight="600"
                >
                  Help & Support
                </Text>
              </Box>
              <Text
                variant="bodySmall"
                color="text.secondary"
                lineHeight={18}
                mb="sm"
              >
                If this error persists, your session progress has been automatically saved. You can resume from where you left off.
              </Text>
              <Box flexDirection="row" gap="sm">
                <TouchableOpacity onPress={onReport}>
                  <Text
                    variant="caption"
                    color="primary.DEFAULT"
                    textDecorationLine="underline"
                  >
                    Report Issue
                  </Text>
                </TouchableOpacity>
                <Text
                  variant="caption"
                  color="text.tertiary"
                >
                  •
                </Text>
                <TouchableOpacity onPress={onReset}>
                  <Text
                    variant="caption"
                    color="primary.DEFAULT"
                    textDecorationLine="underline"
                  >
                    Reset Session
                  </Text>
                </TouchableOpacity>
              </Box>
            </Box>
          </Animated.View>

          {/* Recovery Status */}
          {variant === 'recovery' && (
            <Animated.View entering={FadeIn.delay(1000)}>
              <Box
                bg="info.light"
                p="md"
                borderRadius={8}
                mt="lg"
                width="100%"
              >
                <Box flexDirection="row" alignItems="center">
                  <Icon
                    name="info"
                    size={16}
                    color={theme.colors.info.DEFAULT}
                    mr="xs"
                  />
                  <Text
                    variant="caption"
                    color={theme.colors.info.DEFAULT}
                  >
                    Recovery in progress...
                  </Text>
                </Box>
              </Box>
            </Animated.View>
          )}
        </Box>
      </Animated.View>
    </Box>
  );
};

export default CombatErrorState;
