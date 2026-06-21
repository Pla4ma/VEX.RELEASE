import React from 'react';
import { Box } from '../../../components/primitives/Box'
import { Card } from '../../../components/primitives'
import { Text } from '../../../components/primitives/Text';
import type { CompanionMemory } from '../../../features/companion/memory-types';

const memoryDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
});

interface CompanionMemoryCardProps {
  memory: CompanionMemory;
}

export function CompanionMemoryCard({
  memory,
}: CompanionMemoryCardProps): React.ReactNode {
  return (
    <Card
      accessibilityHint="Read-only companion memory"
      accessibilityLabel={`${memory.title}. ${memory.body}`}
      accessibilityRole="summary"
      size="md"
    >
      <Box gap="xs">
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          gap="sm"
        >
          <Text variant="caption" color="text.tertiary">
            {formatMemoryDate(memory.sessionDate)}
          </Text>
          {memory.grade ? (
            <Box px="sm" py="xs" borderRadius="full" bg="background.tertiary">
              <Text variant="caption" color="text.primary" fontWeight="700">
                {memory.grade}
              </Text>
            </Box>
          ) : null}
        </Box>
        <Text variant="body" color="text.primary" fontWeight="700">
          {memory.title}
        </Text>
        <Text variant="bodySmall" color="text.secondary" numberOfLines={3}>
          {memory.body}
        </Text>
      </Box>
    </Card>
  );
}

function formatMemoryDate(date: string): string {
  return memoryDateFormatter.format(new Date(`${date}T00:00:00.000Z`));
}
