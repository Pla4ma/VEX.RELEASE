import React from 'react';
import { View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Box, Text } from '../../../components/primitives/Box';
import { GlassCard } from '../../../components/glass/GlassCard';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { EmptyStateLens } from '../../../components/glass/EmptyStateLens';
import { ErrorState } from '../../../components/states/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { usePersonalBests } from '../../../features/personal-bests/hooks';
import type { PersonalBest } from '../../../features/personal-bests/types';

const renderPersonalBest: ListRenderItem<PersonalBest> = ({ item }) => (
  <PersonalBestCard item={item} />
);
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { PersonalBestCard } from './PersonalBestCard';

const ESTIMATED_ITEM_SIZE = 88;

function PersonalBestsSkeleton(): React.ReactNode {
  return (
    <GlassCard size="lg" padding={18} radius={26} variant="default">
      <Skeleton width="44%" height={20} borderRadius={8} />
      <Box mt={12} gap={10}>
        <Skeleton height={64} borderRadius={16} />
        <Skeleton height={64} borderRadius={16} />
      </Box>
    </GlassCard>
  );
}

export function PersonalBestsGrid({
  userId,
}: {
  userId: string | null;
}): React.ReactNode {
  const query = usePersonalBests(userId);
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
      <GlassCard size="lg" padding={18} radius={26} variant="default">
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            right: 10,
            top: 10,
            zIndex: 0,
          }}
        >
          <FloatingDroplets count={3} opacity={0.65} size={28} />
        </View>
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            left: 10,
            bottom: 10,
            zIndex: 0,
          }}
        >
          <EmptyStateLens size={56} opacity={0.65} dotCount={3} />
        </View>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 16,
            fontWeight: '800',
            letterSpacing: -0.2,
          }}
        >
          Personal bests
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 13,
            lineHeight: 19,
            marginTop: 6,
          }}
        >
          Complete a session to set your first personal best.
        </Text>
      </GlassCard>
    );
  }
  return (
    <View
      style={{
        height: Math.max(
          192,
          query.data.length * ESTIMATED_ITEM_SIZE,
        ),
      }}
    >
      <FlashList
        data={query.data}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        keyExtractor={(item: PersonalBest) => item.id}
        renderItem={renderPersonalBest}
        scrollEnabled={false}
      />
    </View>
  );
}
