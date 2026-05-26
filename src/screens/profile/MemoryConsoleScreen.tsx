import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  deleteMemory,
  useActiveFocusMemories,
  useMemoryConsoleVisibility,
} from '../../features/focus-memory';
import type { FocusMemory } from '../../features/focus-memory';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';
import { Box, Card, Text } from '../../components/primitives';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { EmptyState } from '../../components/EmptyState';
import type { ExtendedRootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<ExtendedRootStackParams, 'MemoryConsole'>;

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function confidenceLabel(c: number): { label: string; color: string } {
  if (c >= 0.8) return { label: 'High', color: '#22c55e' };
  if (c >= 0.5) return { label: 'Medium', color: '#eab308' };
  return { label: 'Low', color: '#ef4444' };
}

export const MemoryConsoleScreen: React.FC<Props> = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const userId = user?.id ?? null;
  const { isVisible } = useMemoryConsoleVisibility(userId);
  const { data: memories, refetch } = useActiveFocusMemories(userId);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = useCallback(
    (memory: FocusMemory) => {
      Alert.alert(
        'Delete Memory',
        `Remove "${memory.summary}"? This cannot be undone. VEX will not regenerate this from the same evidence.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              if (!userId) return;
              setDeleting(memory.id);
              try {
                await deleteMemory(memory.id, userId);
                await refetch();
              } finally {
                setDeleting(null);
              }
            },
          },
        ],
      );
    },
    [userId, refetch],
  );

  if (!isVisible) {
    return (
      <Box flex={1} style={{ backgroundColor: theme.colors.background.primary, paddingTop: insets.top }}>
        <EmptyState
          icon="⏳"
          title="Memory Console"
          body="VEX needs at least 3 completed sessions before memory insights become available. Keep focusing."
        />
      </Box>
    );
  }

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + theme.spacing[4],
          paddingHorizontal: theme.spacing[4],
          paddingBottom: insets.bottom + theme.spacing[4],
        }}
      >
        <Text variant="h2" style={{ fontWeight: '800', marginBottom: 4 }}>
          Memory Console
        </Text>
        <Text variant="body" color="text.secondary" style={{ marginBottom: theme.spacing[4] }}>
          {memories.length} memory {memories.length === 1 ? 'entry' : 'entries'} · inspect, edit, or delete
        </Text>

        {memories.length === 0 ? (
          <EmptyState
            icon="🧠"
            title="No memories yet"
            body="Memories build from completed sessions, reflections, and behavior patterns."
          />
        ) : (
          memories.map((memory) => {
            const conf = confidenceLabel(memory.confidence);
            const isDeleting = deleting === memory.id;
            return (
              <Card
                key={memory.id}
                size="md"
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  marginBottom: theme.spacing[3],
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Text variant="caption" color="text.tertiary" style={{ textTransform: 'uppercase' }}>
                    {memory.type}
                  </Text>
                  <Text variant="caption" style={{ color: conf.color, fontWeight: '700' }}>
                    {conf.label} ({memory.confidence.toFixed(2)})
                  </Text>
                </Box>
                <Text variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>
                  {memory.summary}
                </Text>
                <Box flexDirection="row" justifyContent="space-between" alignItems="center" mt={2}>
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
                      onPress={() => handleDelete(memory)}
                      disabled={isDeleting}
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
          })
        )}
      </ScrollView>
    </Box>
  );
};

export default withScreenErrorBoundary(MemoryConsoleScreen, 'MemoryConsole');
