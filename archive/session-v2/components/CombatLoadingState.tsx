/**
 * Combat Loading State
 * 
 * Loading component for combat initialization and transitions.
 * Provides visual feedback during combat setup and data loading.
 */

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Box } from '../../components/primitives';
import { Icon } from '../../icons';

interface CombatLoadingStateProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  variant?: 'initializing' | 'loading' | 'transitioning';
}

export const CombatLoadingState: React.FC<CombatLoadingStateProps> = ({
  message = 'Preparing combat...',
  progress = 0,
  showProgress = false,
  variant = 'loading',
}) => {
  const { theme } = useTheme();

  const getLoadingIcon = () => {
    switch (variant) {
      case 'initializing':
        return 'sword';
      case 'loading':
        return 'shield';
      case 'transitioning':
        return 'zap';
      default:
        return 'shield';
    }
  };

  const getLoadingColor = () => {
    switch (variant) {
      case 'initializing':
        return theme.colors.primary[500];
      case 'loading':
        return theme.colors.warning.DEFAULT;
      case 'transitioning':
        return theme.colors.success.DEFAULT;
      default:
        return theme.colors.primary[500];
    }
  };

  return (
    <Box
      flex={1}
      bg="background.secondary"
      justifyContent="center"
      alignItems="center"
      p="lg"
    >
      <Animated.View entering={BounceIn.duration(600)}>
        <Box alignItems="center">
          {/* Loading Icon */}
          <Box
            width={80}
            height={80}
            borderRadius={40}
            bg={`${getLoadingColor()}20`}
            justifyContent="center"
            alignItems="center"
            mb="lg"
          >
            <Icon
              name={getLoadingIcon()}
              size={40}
              color={getLoadingColor()}
            />
          </Box>

          {/* Loading Message */}
          <Text
            variant="h4"
            color="text.primary"
            textAlign="center"
            mb="md"
          >
            {message}
          </Text>

          {/* Progress Bar */}
          {showProgress && (
            <Box width="100%" maxWidth={300} mb="md">
              <Box
                height={4}
                bg="gray.700"
                borderRadius={2}
                overflow="hidden"
              >
                <Animated.View
                  entering={FadeIn.duration(300)}
                  style={{
                    height: '100%',
                    backgroundColor: getLoadingColor(),
                    borderRadius: 2,
                    width: `${progress}%`,
                  }}
                />
              </Box>
              <Text
                variant="caption"
                color="text.tertiary"
                textAlign="center"
                mt="xs"
              >
                {Math.round(progress)}%
              </Text>
            </Box>
          )}

          {/* Activity Indicator */}
          <ActivityIndicator
            size="large"
            color={getLoadingColor()}
            style={{ marginTop: 16 }}
          />

          {/* Loading Tips */}
          <Animated.View entering={FadeIn.delay(500)}>
            <Box
              bg="background.primary"
              p="md"
              borderRadius={12}
              mt="lg"
              maxWidth={300}
            >
              <Text
                variant="bodySmall"
                color="text.secondary"
                textAlign="center"
              >
                💡 Tip: Use abilities strategically to build combos and maximize damage!
              </Text>
            </Box>
          </Animated.View>
        </Box>
      </Animated.View>
    </Box>
  );
};

export default CombatLoadingState;
