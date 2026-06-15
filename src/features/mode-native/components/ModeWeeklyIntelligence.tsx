import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useModeWeeklyIntelligence } from '../hooks';
import type { Lane } from '../../lane-engine/types';

interface ModeWeeklyIntelligenceProps {
  userId: string | null | undefined;
  lane: Lane | null | undefined;
  completedSessions?: number;
  totalSessions?: number;
  cleanStarts?: number;
  duration?: number;
}

export function ModeWeeklyIntelligence({
  userId,
  lane,
  completedSessions = 0,
  totalSessions = 0,
  cleanStarts = 0,
  duration = 15,
}: ModeWeeklyIntelligenceProps): React.ReactNode {
  const { data } = useModeWeeklyIntelligence(userId, {
    laneOverride: lane,
    completedSessions,
    totalSessions,
    cleanStarts,
    duration,
  });

  if (!data) {
    return <Box />;
  }

  return (
    <Box
      mx="md"
      my="sm"
      p="md"
      borderRadius="lg"
      bg="background.secondary"
      gap="md"
    >
      <Box gap="xs">
        <Text variant="caption" color="text.tertiary" textTransform="uppercase">
          Weekly Intelligence
        </Text>
        <Text variant="h4" color="text.primary">
          {data.headline}
        </Text>
        <Text variant="bodySmall" color="text.secondary">
          {data.body}
        </Text>
      </Box>

      {/* Primary metric */}
      <Box
        p="md"
        borderRadius="md"
        bg="background.elevated"
        borderWidth={1}
        borderColor="border.light"
      >
        <Text variant="caption" color="text.tertiary">
          {data.primaryMetric}
        </Text>
        <Text variant="body" color="text.primary" mt="xs">
          {data.primaryMetricValue}
        </Text>
      </Box>

      {/* Adjustment */}
      <Box gap="xs">
        <Text variant="caption" color="text.tertiary">
          What to try this week
        </Text>
        <Text variant="bodySmall" color="text.primary">
          {data.adjustment}
        </Text>
      </Box>

      {data.nextSessionType ? (
        <Box gap="xs">
          <Text variant="caption" color="text.tertiary">
            Best next session
          </Text>
          <Text variant="label" color="primary.500" fontWeight="600">
            {data.nextSessionType}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
}
