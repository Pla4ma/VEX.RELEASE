/**
 * TierRewardDetail
 *
 * Bottom sheet showing tier reward details.
 * Includes tier number, XP required, both free and premium rewards,
 * claim buttons, and preview for premium rewards (if not premium).
 */

import React from "react";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Box, Text, Button } from "@/components/primitives";
import { useTheme } from "@/theme";
import type { TierDisplay, TierReward, RewardType } from "../types";

// ============================================================================
// Constants
// ============================================================================

const REWARD_ICONS: Record<RewardType, string> = {
  XP: "⭐",
  COINS: "🪙",
  GEMS: "💎",
  ITEM: "🎁",
  COSMETIC: "👕",
  TITLE: "👑",
  STREAK_SHIELD: "🛡️",
  BOOST: "⚡",
  AVATAR_FRAME: "🖼️",
  EMOTE: "😊",
};

const REWARD_LABELS: Record<RewardType, string> = {
  XP: "Experience Points",
  COINS: "Coins",
  GEMS: "Gems",
  ITEM: "Item",
  COSMETIC: "Cosmetic",
  TITLE: "Title",
  STREAK_SHIELD: "Streak Shield",
  BOOST: "XP Boost",
  AVATAR_FRAME: "Avatar Frame",
  EMOTE: "Emote",
};

const RARITY_COLORS = {
  common: "#94A3B8",
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#FFD700",
};

const RARITY_LABELS = {
  common: "COMMON",
  rare: "RARE",
  epic: "EPIC",
  legendary: "LEGENDARY",
};

// ============================================================================
// Types
// ============================================================================

interface TierRewardDetailProps {
  tier: TierDisplay;
  currentTier: number;
  hasPremium: boolean;
  onClaimFree: () => void;
  onClaimPremium: () => void;
  onUpgrade: () => void;
  onClose: () => void;
}

// ============================================================================
// Reward Card Component
// ============================================================================

const RewardCard: React.FC<{
  reward: TierReward;
  isClaimed: boolean;
  canClaim: boolean;
  isPremium: boolean;
  track: "FREE" | "PREMIUM";
  onClaim: () => void;
  onUpgrade: () => void;
}> = ({ reward, isClaimed, canClaim, isPremium, track, onClaim, onUpgrade }) => {
  const { theme } = useTheme();
  const rarity = reward.rarity.toLowerCase() as keyof typeof RARITY_COLORS;
  const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.common;

  const isLocked = track === "PREMIUM" && !isPremium;

  return (
    <Animated.View entering={FadeInUp.duration(300)}>
      <Box
        p={4}
        borderRadius={16}
        bg={theme.colors.background.secondary}
        style={{
          borderWidth: 2,
          borderColor: isClaimed ? theme.colors.success.DEFAULT : rarityColor,
          opacity: isLocked ? 0.6 : 1,
        }}
      >
        {/* Track badge */}
        <Box px={3} py={1} borderRadius={8} bg={track === "FREE" ? theme.colors.success.DEFAULT : theme.colors.warning.DEFAULT} alignSelf="flex-start" mb={3}>
          <Text variant="caption" color="#FFFFFF" fontWeight="bold">
            {track === "FREE" ? "FREE TRACK" : "👑 PREMIUM"}
          </Text>
        </Box>

        {/* Reward icon */}
        <Box alignItems="center" mb={3}>
          <Box
            width={80}
            height={80}
            borderRadius={40}
            bg={`${rarityColor}25`}
            alignItems="center"
            justifyContent="center"
            style={{
              borderWidth: 3,
              borderColor: rarityColor,
            }}
          >
            <Text style={{ fontSize: 40 }}>{REWARD_ICONS[reward.type]}</Text>
          </Box>
        </Box>

        {/* Reward details */}
        <Box alignItems="center" mb={3}>
          <Text variant="h3" color={theme.colors.text.primary} textAlign="center">
            {reward.amount?.toLocaleString()} {REWARD_LABELS[reward.type]}
          </Text>

          <Box mt={2} px={3} py={1} borderRadius={8} style={{ backgroundColor: `${rarityColor}30` }}>
            <Text variant="caption" color={rarityColor} fontWeight="bold">
              {RARITY_LABELS[rarity]}
            </Text>
          </Box>
        </Box>

        {/* Action button */}
        {isClaimed ? (
          <Box p={3} borderRadius={12} bg={theme.colors.success.DEFAULT} alignItems="center">
            <Text variant="body" color="#FFFFFF" fontWeight="bold">
              ✅ Claimed
            </Text>
          </Box>
        ) : isLocked ? (
          <Button variant="outline" size="lg" fullWidth onPress={onUpgrade} accessibilityLabel="👑 Upgrade to Claim button" accessibilityRole="button" accessibilityHint="Activates this control">
            👑 Upgrade to Claim
          </Button>
        ) : canClaim ? (
          <Button variant="primary" size="lg" fullWidth onPress={onClaim} accessibilityLabel="Claim Reward button" accessibilityRole="button" accessibilityHint="Activates this control">
            Claim Reward
          </Button>
        ) : (
          <Box p={3} borderRadius={12} bg={theme.colors.background.tertiary} alignItems="center">
            <Text variant="body" color={theme.colors.text.tertiary}>
              🔒 Reach Tier to Unlock
            </Text>
          </Box>
        )}
      </Box>
    </Animated.View>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const TierRewardDetail: React.FC<TierRewardDetailProps> = ({ tier, currentTier, hasPremium, onClaimFree, onClaimPremium, onUpgrade, onClose }) => {
  const { theme } = useTheme();

  const isUnlocked = tier.tierNumber <= currentTier;
  const canClaimFree = isUnlocked && tier.freeStatus === "AVAILABLE";
  const canClaimPremium = isUnlocked && hasPremium && tier.premiumStatus === "AVAILABLE";

  // Calculate XP needed for this tier
  const xpRequired = tier.xpRequired || tier.tierNumber * 1000;

  return (
    <Box flex={1} bg={theme.colors.background.primary} style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
      {/* Handle indicator */}
      <Box alignItems="center" pt={3} pb={2}>
        <Box width={40} height={4} borderRadius={2} bg={theme.colors.border.DEFAULT} />
      </Box>

      {/* Header */}
      <Box px={6} py={4} alignItems="center">
        <Text variant="caption" color={theme.colors.text.tertiary} mb={1}>
          TIER {tier.tierNumber}
        </Text>
        <Text variant="h2" color={theme.colors.text.primary}>
          {tier.tierNumber <= currentTier ? "Tier Unlocked!" : "Locked Tier"}
        </Text>

        {/* XP requirement */}
        <Box flexDirection="row" alignItems="center" mt={2} gap={2}>
          <Text style={{ fontSize: 16 }}>⭐</Text>
          <Text variant="body" color={theme.colors.text.secondary}>
            {xpRequired.toLocaleString()} XP required
          </Text>
        </Box>
      </Box>

      {/* Progress indicator */}
      <Box px={6} mb={4}>
        <Box height={8} borderRadius={4} bg={theme.colors.background.tertiary} style={{ overflow: "hidden" }}>
          <Box
            height="100%"
            borderRadius={4}
            bg={tier.tierNumber <= currentTier ? theme.colors.success.DEFAULT : theme.colors.primary[500]}
            style={{
              width: tier.tierNumber <= currentTier ? "100%" : `${Math.max(0, Math.min(100, (currentTier / tier.tierNumber) * 100))}%`,
            }}
          />
        </Box>
        <Text variant="caption" color={theme.colors.text.tertiary} textAlign="center" mt={1}>
          {tier.tierNumber <= currentTier ? "Tier completed!" : `${tier.tierNumber - currentTier} tiers away`}
        </Text>
      </Box>

      {/* Rewards */}
      <Box px={6} gap={4}>
        {/* Free reward */}
        {tier.freeReward && <RewardCard reward={tier.freeReward} isClaimed={tier.freeStatus === "CLAIMED"} canClaim={canClaimFree} isPremium={hasPremium} track="FREE" onClaim={onClaimFree} onUpgrade={onUpgrade} />}

        {/* Premium reward */}
        {tier.premiumReward && <RewardCard reward={tier.premiumReward} isClaimed={tier.premiumStatus === "CLAIMED"} canClaim={canClaimPremium} isPremium={hasPremium} track="PREMIUM" onClaim={onClaimPremium} onUpgrade={onUpgrade} />}
      </Box>

      {/* Premium upsell (if not premium) */}
      {!hasPremium && tier.premiumReward && (
        <Box px={6} mt={4}>
          <Box
            p={4}
            borderRadius={16}
            style={{
              backgroundColor: `${theme.colors.warning.DEFAULT}15`,
              borderWidth: 1,
              borderColor: theme.colors.warning.DEFAULT,
            }}
          >
            <Box flexDirection="row" alignItems="center" gap={2} mb={2}>
              <Text style={{ fontSize: 24 }}>👑</Text>
              <Text variant="h4" color={theme.colors.warning.DEFAULT}>
                Upgrade to Premium
              </Text>
            </Box>
            <Text variant="body" color={theme.colors.text.secondary} mb={3}>
              Unlock this and all other premium rewards instantly. Plus get 2x rewards on every tier!
            </Text>
            <Button variant="primary" size="lg" fullWidth onPress={onUpgrade} accessibilityLabel="Upgrade Now button" accessibilityRole="button" accessibilityHint="Activates this control">
              Upgrade Now
            </Button>
          </Box>
        </Box>
      )}

      {/* Close button */}
      <Box px={6} py={4}>
        <Button variant="ghost" size="md" fullWidth onPress={onClose} accessibilityLabel="Close button" accessibilityRole="button" accessibilityHint="Activates this control">
          Close
        </Button>
      </Box>

      {/* Bottom spacing */}
      <Box height={20} />
    </Box>
  );
};

// ============================================================================
// Export
// ============================================================================

export default TierRewardDetail;
