import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text , Text as VexText } from '../../../components/primitives/Text';
import { sizing } from '../../../theme/tokens/sizing';
import { vexFire } from '../../../theme/tokens/vex-fire';

export function HistorySkeleton(): React.ReactNode {
  return (
    <Box p="lg">
      {[0, 1, 2].map((key) => (
        <Box
          key={key}
          style={{ backgroundColor: vexFire.panel, borderColor: vexFire.border, borderWidth: 1 }}
          borderRadius="lg"
          height={sizing.height['2xl']}
          mb="sm"
        />
      ))}
    </Box>
  );
}

export function HistoryEmptyState({
  onStart,
}: {
  onStart: () => void;
}): React.ReactNode {
  return (
    <Box flex={1} justifyContent="center" alignItems="center" p="xl">
      <Text variant="h3" style={{ color: vexFire.cream }} textAlign="center" mb="md">
        Your record starts with one real session.
      </Text>
      <Text variant="body" style={{ color: vexFire.textSecondary }} textAlign="center" mb="lg">
        Finish a focus block and VEX will track the rhythm you actually built.
      </Text>
      <Button
        accessibilityHint="Starts setup for a new focus session"
        accessibilityLabel="Start a focus session"
        accessibilityRole="button"
        onPress={onStart}
        variant="primary"
      >
        <VexText>Start Focus</VexText>
      </Button>
    </Box>
  );
}
