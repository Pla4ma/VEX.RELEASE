import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import type { SessionHistoryStats } from '../types';
import { vexFire } from '../../../theme/tokens/vex-fire';

export function HistoryStats({
  stats,
}: {
  stats: SessionHistoryStats;
}): React.ReactNode {
  return (
    <Box flexDirection="row" borderRadius="lg" p="md" style={{ backgroundColor: vexFire.panel, borderColor: vexFire.border, borderWidth: 1 }}>
      <Box flex={1} alignItems="center">
        <Text variant="h4" style={{ color: vexFire.ember }}>
          {stats.completedSessions}
        </Text>
        <Text variant="caption" style={{ color: vexFire.textSecondary }}>
          Completed
        </Text>
      </Box>
      <Box flex={1} alignItems="center">
        <Text variant="h4" style={{ color: vexFire.amber }}>
          {Math.floor(stats.totalFocusSeconds / 3600)}
        </Text>
        <Text variant="caption" style={{ color: vexFire.textSecondary }}>
          Hours
        </Text>
      </Box>
      <Box flex={1} alignItems="center">
        <Text variant="h4" style={{ color: vexFire.success }}>
          {stats.averageScore ?? 'Not yet'}
        </Text>
        <Text variant="caption" style={{ color: vexFire.textSecondary }}>
          Avg Score
        </Text>
      </Box>
    </Box>
  );
}
