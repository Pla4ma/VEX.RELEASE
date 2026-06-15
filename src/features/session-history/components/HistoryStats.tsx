import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import type { SessionHistoryStats } from '../types';

export function HistoryStats({
  stats,
}: {
  stats: SessionHistoryStats;
}): React.ReactNode {
  return (
    <Box flexDirection="row" bg="background.secondary" borderRadius="lg" p="md">
      <Box flex={1} alignItems="center">
        <Text variant="h4" color="primary.500">
          {stats.completedSessions}
        </Text>
        <Text variant="caption" color="text.secondary">
          Completed
        </Text>
      </Box>
      <Box flex={1} alignItems="center">
        <Text variant="h4" color="warning.DEFAULT">
          {Math.floor(stats.totalFocusSeconds / 3600)}
        </Text>
        <Text variant="caption" color="text.secondary">
          Hours
        </Text>
      </Box>
      <Box flex={1} alignItems="center">
        <Text variant="h4" color="success.DEFAULT">
          {stats.averageScore ?? 'Not yet'}
        </Text>
        <Text variant="caption" color="text.secondary">
          Avg Score
        </Text>
      </Box>
    </Box>
  );
}
