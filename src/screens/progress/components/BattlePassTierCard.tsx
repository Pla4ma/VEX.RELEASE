/**
 * BattlePassTierCard Component
 *
 * Individual tier reward card showing free/premium reward.
 *
 * @phase 0A.3
 */

import React from 'react';
import { Pressable } from 'react-native';
import { Box, Text, Button } from '@/components/primitives';
import { useTheme } from '@/theme';
import type { BattlePassTier, RewardType } from '@/features/battle-pass/types';
import { launchColors } from '@theme/tokens/launch-colors';


type TrackType = 'FREE' | 'PREMIUM';

interface BattlePassTierCardProps {
  tier: BattlePassTier;
  currentTier: number;
  hasPremium: boolean;
  trackType: TrackType;
  onClaim: (tierId: string, track: TrackType) => void;
  onPress: (tier: BattlePassTier, track: TrackType) => void;
}

const TIER_ITEM_WIDTH = 100;

const REWARD_ICONS: Record<RewardType, string> = {
  XP: '⭐',
  COINS: '🪙',
  GEMS: '💎',
  ITEM: '🎁',
  COSMETIC: '👕',
  TITLE: '👑',
  STREAK_SHIELD: '🛡️',
  BOOST: '⚡',
  AVATAR_FRAME: '🖼️',
  EMOTE: '😀',
};

const RARITY_COLORS: Record<string, string> = {
  common: launchColors.hex_94a3b8,
  rare: launchColors.hex_3b82f6,
  epic: launchColors.hex_a855f7,
  legendary: launchColors.hex_ffd700,
};

export function BattlePassTierCard({
  tier,
  currentTier,
  hasPremium,
  trackType,
  onClaim,
  onPress,
}: BattlePassTierCardProps): JSX.Element {
  const { theme } = useTheme();

  // Use tierNumber from actual type
  const tierNumber = tier.tierNumber;
  const isUnlocked = tierNumber <= currentTier;
  const isCurrent = tierNumber === currentTier + 1;
  const isLocked = tierNumber > currentTier + 1;

  // Get reward based on track type and tier fields
  const reward = trackType === 'FREE'
    ? tier.freeRewardId ? {
        type: tier.freeRewardType || 'XP',
        amount: tier.freeRewardAmount || 0,
        rarity: 'common' as const,
      } : null
    : tier.premiumRewardId ? {
        type: tier.premiumRewardType || 'XP',
        amount: tier.premiumRewardAmount || 0,
        rarity: tier.premiumRewardId ? 'rare' : 'common' as const,
      } : null;

  // Check if claimed (would need actual user progress data)
  const isClaimed = false;
  const canClaim = isUnlocked && !isClaimed && (trackType === 'FREE' || hasPremium);

  const rarityColor = reward
    ? RARITY_COLORS[String(reward.rarity)] || theme.colors.border.DEFAULT
    : theme.colors.border.DEFAULT;

  return (
    <Pressable onPress={() => onPress(tier, trackType)}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Box
        width={TIER_ITEM_WIDTH}
        mx="xs"
        py="md"
        alignItems="center"
      >
        {/* Tier number */}
        <Box
          width={32}
          height={32}
          borderRadius="full"
          bg={isCurrent ? theme.colors.primary[500] : isUnlocked ? theme.colors.success.DEFAULT : theme.colors.background.tertiary}
          alignItems="center"
          justifyContent="center"
          mb="sm"
          style={{
            borderWidth: 2,
            borderColor: isCurrent ? theme.colors.primary[500] : theme.colors.border.DEFAULT,
          }}
        >
          <Text
            variant="caption"
            color={isCurrent || isUnlocked ? launchColors.hex_ffffff : theme.colors.text.tertiary}
            fontWeight="bold"
          >
            {tierNumber}
          </Text>
        </Box>

        {/* Reward card */}
        <Box
          width={80}
          height={100}
          borderRadius="xl"
          bg={theme.colors.background.tertiary}
          alignItems="center"
          justifyContent="center"
          style={{
            borderWidth: 2,
            borderColor: isClaimed ? theme.colors.success.DEFAULT : isUnlocked ? rarityColor : theme.colors.border.DEFAULT,
            opacity: isLocked ? 0.5 : 1,
          }}
        >
          {reward && reward.amount > 0 ? (
            <>
              <Text style={{ fontSize: 28 }}>{REWARD_ICONS[reward.type]}</Text>
              <Text
                variant="caption"
                color={theme.colors.text.secondary}
                textAlign="center"
                mt="xs"
                numberOfLines={1}
              >
                {reward.amount.toLocaleString()}
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: 24 }}>🔒</Text>
          )}

          {/* Claimed checkmark */}
          {isClaimed && (
            <Box
              position="absolute"
              top={-4}
              right={-4}
              width={20}
              height={20}
              borderRadius="full"
              bg={theme.colors.success.DEFAULT}
              alignItems="center"
              justifyContent="center"
            >
              <Text style={{ fontSize: 12, color: launchColors.hex_ffffff }}>✓</Text>
            </Box>
          )}
        </Box>

        {/* Claim button */}
        {canClaim && (
          <Button
            variant="primary"
            size="sm"
            onPress={() => onClaim(tier.id, trackType)}

          accessibilityLabel="Claim button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
            Claim
          </Button>
        )}
      </Box>
    </Pressable>
  );
}
