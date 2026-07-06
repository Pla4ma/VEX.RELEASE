import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Box } from '../../../components/primitives/Box';
import { Card } from '../../../components/primitives/Card';
import { Text } from '../../../components/primitives/Text';
import type { FocusMemory } from '../../../features/focus-memory/service';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface MemoryConsoleCardProps {
  memory: FocusMemory;
  deleting: boolean;
  onDelete: (memory: FocusMemory) => void;
}

export function MemoryConsoleCard({
  memory,
  deleting,
  onDelete,
}: MemoryConsoleCardProps): React.ReactElement {
  const { theme } = useTheme();
  const colors = theme.colors.semantic;
  let label = 'Low';
  let color = colors.danger;
  if (memory.confidence >= 0.8) {
    label = 'High';
    color = colors.success;
  } else if (memory.confidence >= 0.5) {
    label = 'Medium';
    color = colors.warning;
  }

  return (
    <Card
      size="md"
      style={{
        backgroundColor: theme.colors.background.secondary,
        marginBottom: theme.spacing[3],
        opacity: deleting ? 0.5 : 1,
      }}
    >
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Text
          variant="caption"
          color="text.tertiary"
          style={{ textTransform: 'uppercase' }}
        >
          {memory.type}
        </Text>
        <Text variant="caption" style={{ color, fontWeight: '700' }}>
          {label} ({memory.confidence.toFixed(2)})
        </Text>
      </Box>
      <Text variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>
        {memory.summary}
      </Text>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
      >
        <Text variant="caption" color="text.tertiary">
          {memory.source} · {formatDate(memory.createdAt)}
        </Text>
        <Box flexDirection="row" gap={8}>
          {memory.evidenceHash && (
            <Text variant="caption" color="text.tertiary">
              ev:{memory.evidenceHash.slice(0, 8)}
            </Text>
          )}
          <Pressable
            onPress={() => onDelete(memory)}
            disabled={deleting}
            accessibilityLabel={`Delete memory: ${memory.summary}`}
            accessibilityRole="button"
            accessibilityHint="Permanently removes this memory entry"
            style={{ padding: 4 }}
          >
            <Text variant="caption" color="error.DEFAULT">
              Delete
            </Text>
          </Pressable>
        </Box>
      </Box>
    </Card>
  );
}
