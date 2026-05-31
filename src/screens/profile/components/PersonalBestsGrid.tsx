import React from 'react';
import { View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Badge } from '../../../components/Badge';
import { Box, Card, Text } from '../../../components/primitives';
import { ErrorState } from '../../../components/states/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { usePersonalBests } from '../../../features/personal-bests/hooks';
import type { PersonalBest } from '../../../features/personal-bests/types';
import { useTheme } from '../../../theme';

const ESTIMATED_ITEM_SIZE = 88;

function formatMode(mode: string): string {
  return mode
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}

function formatDuration(bucket: PersonalBest['durationBucket']): string {
  return bucket === '60+' ? '60+ min' : `${bucket} min`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function PersonalBestCard({ item }: { item: PersonalBest }): JSX.Element {
  const { theme } = useTheme();
  const label = `${formatMode(item.sessionMode)} ${formatDuration(item.durationBucket)}, ${Math.round(item.bestPurityScore)} purity, grade ${item.bestGrade}`;
  return (
    <Card
      accessibilityLabel={label}
      size="md"
      style={{
        backgroundColor: theme.colors.background.secondary,
        marginBottom: theme.spacing[3],
      }}
    >
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box flex={1}>
          <Text variant="h4" color="text.primary">
            {formatMode(item.sessionMode)}
          </Text>
          <Text variant="caption" color="text.secondary" mt="xs">
            {`${formatDuration(item.durationBucket)} · Set ${formatDate(item.achievedAt)}`}
          </Text>
        </Box>
        <Box alignItems="flex-end">
          <Badge variant="primary" size="sm">{`Grade ${item.bestGrade}`}</Badge>
          <Text variant="caption" color="text.tertiary" mt="xs">
            {`${Math.round(item.bestPurityScore)} purity`}
          </Text>
        </Box>
      </Box>
    </Card>
  );
}

function PersonalBestsSkeleton(): JSX.Element {
  const { theme } = useTheme();
  return (
    <Card
      size="lg"
      style={{ backgroundColor: theme.colors.background.secondary }}
    >
      <Skeleton
        width="44%"
        height={theme.spacing[5]}
        borderRadius={theme.borderRadius.md}
      />
      <Box mt="md" gap="sm">
        <Skeleton
          height={theme.spacing[12]}
          borderRadius={theme.borderRadius.lg}
        />
        <Skeleton
          height={theme.spacing[12]}
          borderRadius={theme.borderRadius.lg}
        />
      </Box>
    </Card>
  );
}

export function PersonalBestsGrid({
  userId,
}: {
  userId: string | null;
}): JSX.Element {
  const { theme } = useTheme();
  const query = usePersonalBests(userId);
  const renderItem: ListRenderItem<PersonalBest> = ({ item }) => (
    <PersonalBestCard item={item} />
  );
  if (query.isPending) {
    return <PersonalBestsSkeleton />;
  }
  if (query.isError) {
    return (
      <ErrorState
        description="Your records are safe. We could not load them right now."
        onRetry={query.refetch}
        title="Personal bests paused"
      />
    );
  }
  if (query.data.length === 0) {
    return (
      <Card
        size="lg"
        style={{ backgroundColor: theme.colors.background.secondary }}
      >
        <Text variant="h4" color="text.primary">
          Personal bests
        </Text>
        <Text variant="body" color="text.secondary" mt="sm">
          Complete a session to set your first personal best.
        </Text>
      </Card>
    );
  }
  return (
    <View
      style={{
        height: Math.max(
          theme.spacing[24] * 2,
          query.data.length * ESTIMATED_ITEM_SIZE,
        ),
      }}
    >
      <FlashList
        data={query.data}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        keyExtractor={(item: PersonalBest) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
}
