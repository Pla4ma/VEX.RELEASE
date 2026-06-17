import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Card } from '../../../components/primitives/Card';
import { Text } from '../../../components/primitives/Text';
import type { CompanionMemory } from '../memory-types';

type CompanionMemoryItemProps = {
  memory: CompanionMemory;
};

export function CompanionMemoryItem({
  memory,
}: CompanionMemoryItemProps): React.ReactNode {
  return (
    <Card size="md" accessibilityLabel={`${memory.title}. ${memory.body}`}>
      <Box gap="xs">
        <Text variant="caption" color="text.tertiary">
          {memory.type.replace(/_/g, ' ')}
        </Text>
        <Text variant="h4" color="text.primary">
          {memory.title}
        </Text>
        <Text variant="bodySmall" color="text.secondary">
          {memory.body}
        </Text>
      </Box>
    </Card>
  );
}
