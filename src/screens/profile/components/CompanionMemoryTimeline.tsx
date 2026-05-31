import NetInfo from '@react-native-community/netinfo';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { Box, Card, Text } from '../../../components/primitives';
import { ErrorState } from '../../../components/states/ErrorState';
import type { CompanionMemory } from '../../../features/companion/memory-types';
import { CompanionMemoryCard } from './CompanionMemoryCard';

interface CompanionMemoryTimelineProps {
  isError: boolean;
  isPending: boolean;
  memories: CompanionMemory[];
  onRetry: () => void;
}

export function CompanionMemoryTimeline({
  isError,
  isPending,
  memories,
  onRetry,
}: CompanionMemoryTimelineProps): JSX.Element {
  const netInfo = NetInfo.useNetInfo();
  const renderItem: ListRenderItem<CompanionMemory> = useCallback(
    ({ item }) => <CompanionMemoryCard memory={item} />,
    [],
  );

  return (
    <Box gap="md">
      <Text variant="h3" color="text.primary">
        Your Story
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
        <EmptyTimeline />
      ) : null}
      {!isPending && !isError && memories.length > 0 ? (
        <FlashList<CompanionMemory>
          data={memories}
          estimatedItemSize={120}
          keyExtractor={(item: CompanionMemory) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      ) : null}
    </Box>
  );
}

function MemorySkeleton(): JSX.Element {
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
            <Box
              height={14}
              width="80%"
              borderRadius="full"
              bg="background.tertiary"
            />
          </Box>
        </Card>
      ))}
    </Box>
  );
}

function EmptyTimeline(): JSX.Element {
  return (
    <Card size="md" accessibilityLabel="No companion memories yet">
      <Box gap="sm">
        <Text variant="h4" color="text.primary">
          Your companion is watching for milestones.
        </Text>
        <Text variant="bodySmall" color="text.secondary">
          Complete your first session. Your story starts with proof, not
          pressure.
        </Text>
      </Box>
    </Card>
  );
}

function OfflineBanner(): JSX.Element {
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
