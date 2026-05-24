import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
/**
 * BattlePassScreen
 *
 * Main battle pass screen shell. Components split to comply with 200-line limit.
 *
 * @phase 0A.3
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@/components/primitives';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/theme';
import {
  useUserBattlePass,
  useBattlePassTiers,
  useClaimTier,
  battlePassKeys,
} from '@/features/battle-pass/hooks';
import type { BattlePassTier } from '@/features/battle-pass/types';
import { useQueryClient } from '@tanstack/react-query';
import { PremiumPreview } from '@/features/battle-pass/components/PremiumPreview';
import {
  BattlePassSeasonHeader,
  BattlePassXPProgress,
  BattlePassTierTrack,
  BattlePassTrackTabs,
} from './components';

type TrackType = 'FREE' | 'PREMIUM';

const TOTAL_TIERS = 50;

export const BattlePassScreen: React.FC = () => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  // Mock user data - in real app, get from auth context
  const userId = 'current-user';
  const seasonId = 'current-season';

  const { data: battlePass, isLoading: isLoadingBP } = useUserBattlePass(userId, seasonId);
  const { data: tiers, isLoading: isLoadingTiers } = useBattlePassTiers(seasonId);
  const claimMutation = useClaimTier();

  const [activeTrack, setActiveTrack] = useState<TrackType>('FREE');

  // Use real tiers or empty array
  const allTiers = useMemo(() => {
    return tiers && tiers.length > 0 ? tiers : [];
  }, [tiers]);

  const handleClaim = useCallback(async (tierId: string, track: TrackType) => {
    try {
      await claimMutation.mutateAsync({ userId, seasonId, tierNumber: parseInt(tierId.split('-')[1] || '1'), track });
      queryClient.invalidateQueries({ queryKey: battlePassKeys.tiers(seasonId) });
      queryClient.invalidateQueries({ queryKey: battlePassKeys.userProgress(userId, seasonId) });
    } catch (error) {
      // Error handled by mutation
    }
  }, [claimMutation, userId, seasonId, queryClient]);

  const handleTierPress = useCallback((tier: BattlePassTier) => {
    // Would open TierRewardDetail bottom sheet here
  }, []);

  const handleUpgrade = useCallback(() => {
    // Navigate to paywall
  }, []);

  // Loading state
  if (isLoadingBP || isLoadingTiers) {
    return (
      <Box flex={1} bg={theme.colors.background.primary}>
        <Box p="lg" gap="md">
          <Skeleton width={200} height={32} />
          <Skeleton width={150} height={20} />
        </Box>
        <Box p="lg">
          <Skeleton width="100%" height={12} borderRadius={6} />
        </Box>
        <Box height={200} p="lg" flexDirection="row" gap="md">
          {[1, 2, 3, 4, 5].map((key) => (
            <Skeleton key={key} width={80} height={100} borderRadius={12} />
          ))}
        </Box>
      </Box>
    );
  }

  // Default display data when loading or no battle pass
  const displayData = {
    seasonName: 'Season 1: Focus & Flow',
    daysRemaining: 45,
    currentTier: battlePass?.currentTier ?? 1,
    currentXP: battlePass?.tierXp ?? 0,
    tierXP: 10000,
    isPremium: battlePass?.isPremium ?? false,
  };

  return (
    <Box flex={1} bg={theme.colors.background.primary}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BattlePassSeasonHeader
          seasonName={displayData.seasonName}
          daysRemaining={displayData.daysRemaining}
        />

        <BattlePassXPProgress
          currentXP={displayData.currentXP}
          tierXP={displayData.tierXP}
          currentTier={displayData.currentTier}
          totalTiers={TOTAL_TIERS}
        />

        {!displayData.isPremium && (
          <PremiumPreview
            currentTier={displayData.currentTier}
            unlockedPremiumTiers={Math.max(0, displayData.currentTier - 1)}
            upcomingRewards={[
              { tier: displayData.currentTier + 1, name: 'Gem Boost', icon: '💎', type: 'gems', value: '50', rarity: 'epic' },
              { tier: displayData.currentTier + 3, name: 'Exclusive Item', icon: '🎁', type: 'item', value: '1', rarity: 'legendary' },
              { tier: displayData.currentTier + 5, name: 'Coin Bundle', icon: '🪙', type: 'coins', value: '500', rarity: 'rare' },
            ]}
            onUpgrade={handleUpgrade}
            daysRemaining={displayData.daysRemaining}
            hasPremium={displayData.isPremium}
          />
        )}

        <BattlePassTrackTabs
          activeTrack={activeTrack}
          onTrackChange={setActiveTrack}
          hasPremium={displayData.isPremium}
        />

        <BattlePassTierTrack
          tiers={allTiers}
          currentTier={displayData.currentTier}
          hasPremium={displayData.isPremium}
          trackType={activeTrack}
          onClaim={handleClaim}
          onTierPress={handleTierPress}
          isLoading={isLoadingTiers}
        />

        <Box height={40} />
      </ScrollView>
    </Box>
  );
};

export default withScreenErrorBoundary(BattlePassScreen, 'BattlePass');
