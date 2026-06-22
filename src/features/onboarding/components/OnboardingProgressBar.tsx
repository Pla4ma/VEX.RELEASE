/**
 * OnboardingProgressBar Component
 *
 * Progress indicator at top of onboarding flow.
 * Shows which step user is on (1-5) with visual progress.
 *
 * @phase 2.1
 */

import React from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

interface OnboardingProgressBarProps {
  currentStep: number; // 0-4
  totalSteps: number; // 5
}

/**
 * Progress bar component
 */
export function OnboardingProgressBar({
  currentStep,
  totalSteps,
}: OnboardingProgressBarProps): React.ReactNode {
  const { theme } = useTheme();

  const progress = ((currentStep + 1) / totalSteps) * 100;

  const progressStyle = useAnimatedStyle(() => ({
    width: `${withSpring(progress, { damping: 15, stiffness: 100 })}%`,
  }));

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      gap="sm"
      px="lg"
      py="sm"
      bg="background.secondary"
    >
      {/* Progress bar */}
      <Box
        flex={1}
        height={4}
        borderRadius="full"
        bg="background.tertiary"
        overflow="hidden"
      >
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.colors.primary[500],
            },
            progressStyle,
          ]}
        />
      </Box>

      {/* Step indicator */}
      <Box width={50} alignItems="flex-end">
        <Text variant="caption" color="text.tertiary" fontWeight="600">
          {currentStep + 1} / {totalSteps}
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Dots progress indicator (alternative style)
 */
export function OnboardingDots({
  currentStep,
  totalSteps,
}: OnboardingProgressBarProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <Box flexDirection="row" justifyContent="center" gap="sm" py="md">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <Animated.View
            key={index}
            style={{
              width: isActive ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: isCompleted
                ? theme.colors.success.DEFAULT
                : isActive
                  ? theme.colors.primary[500]
                  : theme.colors.background.tertiary,
            }}
          />
        );
      })}
    </Box>
  );
}
