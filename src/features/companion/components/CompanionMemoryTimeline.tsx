import NetInfo from '@react-native-community/netinfo';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import React, { useMemo } from 'react';

import { Box, Button, Card, Text } from '../../../components/primitives';
import { ErrorState } from '../../../components/states/ErrorState';
import type { CompanionMemory } from '../memory-types';
import {
  groupCompanionMemories,
  type CompanionMemoryGroup,
} from './companion-memory-groups';
import { CompanionMemoryItem } from './CompanionMemoryItem';

type CompanionMemoryTimelineProps = {
  isError: boolean;
  isPending: boolean;
  memories: CompanionMemory[];
  onRetry: () => void;
  onStartFocus: () => void;
};

type TimelineRow =
  | { id: string; kind: 'header'; title: CompanionMemoryGroup['title'] }
  | { id: string; kind: 'memory'; memory: CompanionMemory };

export function CompanionMemoryTimeline({
  isError,
  isPending,
  memories,
  onRetry,
  onStartFocus,
}: CompanionMemoryTimelineProps): React.ReactNode {
  const netInfo = NetInfo.useNetInfo();
  const rows = useMemo(() => buildRows(memories), [memories]);
  const renderItem: ListRenderItem<TimelineRow> = ({ item }) => {
    if (item.kind === 'header') {
      return (
        <Text variant="label" color="text.secondary">
          {item.title}
        </Text>
      );
    }
    return <CompanionMemoryItem memory={item.memory} />;
  };

  return (
    <Box gap="md">
      <Text variant="h3" color="text.primary">
        Memories
      </Text>
      {netInfo.isConnected === false ? <OfflineBanner /> : null}
      {isPending ? <MemorySkeleton /> : null}
      {!isPending && isError ? (
        <ErrorState
          title="Your story did not load"
          description="Your companion still has the record. Retry the memory timeline."
          retryLabel="Retry timeline"
          onRetry={onRetry}
        />
      ) : null}
      {!isPending && !isError && memories.length === 0 ? (
        <EmptyTimeline onStartFocus={onStartFocus} />
      ) : null}
      {!isPending && !isError && rows.length > 0 ? (
        <FlashList<TimelineRow>
          data={rows}
          estimatedItemSize={120}
          keyExtractor={(item: TimelineRow) => item.id}
          renderItem={renderItem}
        />
      ) : null}
    </Box>
  );
}

function buildRows(memories: CompanionMemory[]): TimelineRow[] {
  return groupCompanionMemories(memories).flatMap((group) => [
    {
      id: `header-${group.title}`,
      kind: 'header' as const,
      title: group.title,
    },
    ...group.data.map((memory) => ({
      id: memory.id,
      kind: 'memory' as const,
      memory,
    })),
  ]);
}

function MemorySkeleton(): React.ReactNode {
  return (
    <Box gap="sm">
      {[0, 1, 2].map((item) => (
        <Card key={item} size="md" state="loading">
          <Box gap="sm">
            <Box
              height={12}
              width="30%"
              borderRadius="full"
              bg="background.tertiary"
            />
            <Box
              height={18}
              width="60%"
              borderRadius="full"
              bg="background.tertiary"
            />
            <Box
              height={14}
              width="100%"
              borderRadius="full"
              bg="background.tertiary"
            />
          </Box>
        </Card>
      ))}
    </Box>
  );
}

function EmptyTimeline({
  onStartFocus,
}: {
  onStartFocus: () => void;
}): React.ReactNode {
  return (
    <Card size="md" accessibilityLabel="No companion memories yet">
      <Box gap="sm">
        <Text variant="h4" color="text.primary">
          Your story starts with proof.
        </Text>
        <Text variant="bodySmall" color="text.secondary">
          Finish a focus session and your companion will remember the moments
          that matter.
        </Text>
        <Button
          accessibilityHint="Opens session setup to start a focus session"
          accessibilityLabel="Start a focus session"
          accessibilityRole="button"
          onPress={onStartFocus}
          variant="primary"
        >
          Start focus
        </Button>
      </Box>
    </Card>
  );
}

function OfflineBanner(): React.ReactNode {
  return (
    <Card
      size="sm"
      variant="outlined"
      accessibilityLabel="Memory timeline offline"
    >
      <Text variant="bodySmall" color="text.secondary">
        Offline right now. Saved memories stay here, and new ones sync when you
        reconnect.
      </Text>
    </Card>
  );
}
