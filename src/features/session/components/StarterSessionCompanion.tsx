/**
 * StarterSessionCompanion Component
 *
 * Companion waiting state for starter sessions.
 * Shows encouraging companion animation with supportive messaging.
 *
 * @phase 4
 */

import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { CompanionWaiting } from './CompanionWaiting';

interface StarterSessionCompanionProps {
  sessionProgress: number; // 0-1
  elapsedSeconds: number;
  totalSeconds: number;
}

/**
 * Starter session companion component
 */
export function StarterSessionCompanion({
  sessionProgress,
  elapsedSeconds,
  totalSeconds,
}: StarterSessionCompanionProps): JSX.Element {
  // Get encouraging message based on progress
  const getEncouragingMessage = (): string => {
    if (sessionProgress < 0.2) {
      return "You're doing great! Keep going!";
    } else if (sessionProgress < 0.5) {
      return "Nice work! You're building focus.";
    } else if (sessionProgress < 0.8) {
      return "Almost there! You've got this!";
    } else {
      return "Fantastic! You're about to complete your first session!";
    }
  };

  const remainingMinutes = Math.ceil((totalSeconds - elapsedSeconds) / 60);

  return (
    <Box alignItems="center" gap="md" py="lg">
      {/* Companion with waiting animation */}
      <CompanionWaiting progress={sessionProgress} />

      {/* Encouraging message */}
      <Animated.View entering={FadeIn.duration(600)}>
        <Box alignItems="center" gap="xs">
          <Text
            variant="body"
            color="text.secondary"
            textAlign="center"
            fontWeight="600"
          >
            {getEncouragingMessage()}
          </Text>

          {/* Time remaining */}
          <Text variant="bodySmall" color="text.tertiary" textAlign="center">
            {remainingMinutes > 0
              ? `${remainingMinutes} min left`
              : 'Almost done!'}
          </Text>
        </Box>
      </Animated.View>

      {/* Progress indicator */}
      <Box
        width={120}
        height={4}
        borderRadius="full"
        bg="background.secondary"
        overflow="hidden"
      >
        <Box
          width={`${sessionProgress * 100}%`}
          height="100%"
          bg="primary.500"
          borderRadius="full"
        />
      </Box>
    </Box>
  );
}

export default StarterSessionCompanion;
