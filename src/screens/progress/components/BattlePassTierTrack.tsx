/**
 * BattlePassTierTrack Component
 *
 * Horizontal tier track with FlashList and track tabs.
 *
 * @phase 0A.3
 */

import React, { useRef } from 'react';
import { Pressable } from 'react-native';
import { FlashList, type ListRenderItem, type FlashListRef } from '@shopify/flash-list';
import { Box, Text } from '@/components/primitives';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/theme';
import type { BattlePassTier } from '@/features/battle-pass/types';
import { BattlePassTierCard } from './BattlePassTierCard';

type TrackType = 'FREE' | 'PREMIUM';

interface BattlePassTierTrackProps {
  tiers: BattlePassTier[];
  currentTier: number;
  hasPremium: boolean;
  trackType: TrackType;
  onClaim: (tierId: string, track: TrackType) => void;
  onTierPress: (tier: BattlePassTier, track: TrackType) => void;
  isLoading?: boolean;
}

const TIER_ITEM_WIDTH = 100;

function TierSkeleton(): JSX.Element {
  return (
    <Box width={TIER_ITEM_WIDTH} mx="xs" py="md" alignItems="center" gap="sm">
      <Skeleton width={32} height={32} borderRadius={16} />
      <Skeleton width={80} height={100} borderRadius={12} />
    </Box>
  );
}

export function BattlePassTierTrack({
  tiers,
  currentTier,
  hasPremium,
  trackType,
  onClaim,
  onTierPress,
  isLoading,
}: BattlePassTierTrackProps): JSX.Element {
  const { theme } = useTheme();
  const listRef = useRef<FlashListRef<BattlePassTier> | null>(null);

  // Scroll to current tier on mount
  React.useEffect(() => {
    if (listRef.current && currentTier > 0) {
      const index = Math.max(0, currentTier - 3);
      listRef.current.scrollToIndex({ index, animated: true });
    }
  }, [currentTier]);

  const renderItem: ListRenderItem<BattlePassTier> = React.useCallback(({ item }) => (
    <BattlePassTierCard
      tier={item}
      currentTier={currentTier}
      hasPremium={hasPremium}
      trackType={trackType}
      onClaim={onClaim}
      onPress={onTierPress}
    />
  ), [currentTier, hasPremium, trackType, onClaim, onTierPress]);

  const keyExtractor = React.useCallback((item: BattlePassTier) => item.id, []);

  if (isLoading) {
    return (
      <Box height={200} flexDirection="row" px="lg">
        {[1, 2, 3, 4, 5].map((key) => (
          <TierSkeleton key={key} />
        ))}
      </Box>
    );
  }

  return (
    <Box height={220} py="sm">
      <FlashList
        ref={listRef}
        data={tiers}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      />
    </Box>
  );
}

interface BattlePassTrackTabsProps {
  activeTrack: TrackType;
  onTrackChange: (track: TrackType) => void;
  hasPremium: boolean;
}

export function BattlePassTrackTabs({
  activeTrack,
  onTrackChange,
  hasPremium,
}: BattlePassTrackTabsProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box flexDirection="row" p="lg">
      <Pressable onPress={() => onTrackChange('FREE')} style={{ flex: 1 }}
  accessibilityLabel="Free Track button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Box
          py="md"
          borderRadius="xl"
          bg={activeTrack === 'FREE' ? theme.colors.primary[500] : theme.colors.background.tertiary}
          alignItems="center"
        >
          <Text
            variant="body"
            color={activeTrack === 'FREE' ? '#FFFFFF' : theme.colors.text.secondary}
            fontWeight={activeTrack === 'FREE' ? 'bold' : 'normal'}
          >
            Free Track
          </Text>
        </Box>
      </Pressable>

      <Box width={12} />

      <Pressable onPress={() => hasPremium && onTrackChange('PREMIUM')} style={{ flex: 1 }}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Box
          py="md"
          borderRadius="xl"
          bg={activeTrack === 'PREMIUM'
            ? hasPremium
              ? theme.colors.warning.DEFAULT
              : theme.colors.background.tertiary
            : theme.colors.background.tertiary
          }
          alignItems="center"
          style={{ opacity: hasPremium ? 1 : 0.6 }}
        >
          <Text
            variant="body"
            color={activeTrack === 'PREMIUM' && hasPremium ? '#FFFFFF' : theme.colors.text.secondary}
            fontWeight={activeTrack === 'PREMIUM' ? 'bold' : 'normal'}
          >
            {hasPremium ? '👑 Premium' : '🔒 Premium'}
          </Text>
        </Box>
      </Pressable>
    </Box>
  );
}
