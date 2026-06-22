/**
 * SessionPreview Component
 *
 * Session preview card for first session setup screen.
 * Shows selected duration, goal, and estimated XP.
 *
 * @phase 4
 */

import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { FocusDuration } from '../schemas';
import { DURATION_OPTIONS } from '../service';

interface SessionPreviewProps {
  duration: FocusDuration;
  goal: string;
}

/**
 * Session preview card
 */
export function SessionPreview({
  duration,
  goal,
}: SessionPreviewProps): React.ReactNode {
  const { theme } = useTheme();
  const durationOption = DURATION_OPTIONS.find((d) => d.value === duration);

  return (
    <Box
      p="lg"
      borderRadius="xl"
      bg="background.secondary"
      borderWidth={1}
      borderColor="border.light"
      alignItems="center"
      gap="md"
    >
      {/* Duration Display */}
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={32}>{durationOption?.emoji ?? ''}</Text>
        <Text variant="h2" color="text.primary" fontWeight="700">
          {durationOption?.label ?? '10 min'}
        </Text>
      </Box>

      {/* Goal tag */}
      <Box
        flexDirection="row"
        alignItems="center"
        gap="xs"
        px="md"
        py="sm"
        borderRadius="full"
        bg={`${theme.colors.primary[500]}15`}
      >
        <Text fontSize={14} />
        <Text variant="caption" color="primary.500" fontWeight="600">
          {goal || 'General focus'}
        </Text>
      </Box>

      {/* XP hint */}
      <Text variant="bodySmall" color="text.tertiary">
        Estimated: {Math.round(duration * 2)} XP
      </Text>
    </Box>
  );
}

export { SessionPreview }