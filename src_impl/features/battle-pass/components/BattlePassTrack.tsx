/**
 * BattlePassTrack Component
 *
 * Visual tier track showing free and premium rewards.
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useTheme } from "@/theme";
import { Card, Badge, Button } from "../../../components";
import type { BattlePassTier, UserBattlePass } from "../types";
import { createSheet } from "@/shared/ui/create-sheet";

interface BattlePassTrackProps {
  tiers: BattlePassTier[];
  userProgress: UserBattlePass | null;
  onClaimTier?: (tierNumber: number) => void;
  onPurchasePremium?: () => void;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function BattlePassTrack({ tiers, userProgress, onClaimTier, onPurchasePremium, loading, error, onRetry }: BattlePassTrackProps): JSX.Element {
  const { theme } = useTheme();
  if (loading) {
    return (
      <Card style={containerStyle}>
        <View style={skeletonTrackStyle} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[containerStyle, errorContainerStyle]}>
        <Text style={errorTextStyle}>Failed to load battle pass</Text>
        {onRetry && (
          <Button variant="secondary" onPress={onRetry} accessibilityLabel="Retry button" accessibilityRole="button" accessibilityHint="Activates this control">
            Retry
          </Button>
        )}
      </Card>
    );
  }

  if (!tiers.length || !userProgress) {
    return (
      <Card style={containerStyle}>
        <Text style={emptyTextStyle}>No battle pass data available</Text>
      </Card>
    );
  }

  const currentTierNum = userProgress.currentTier;
  const hasPremium = userProgress.isPremium;

  return (
    <ScrollView style={scrollContainerStyle}>
      <Card style={containerStyle}>
        {/* Header */}
        <View style={headerStyle}>
          <View style={progressInfoStyle}>
            <Text style={tierTextStyle}>Tier {currentTierNum}</Text>
            <Text style={xpTextStyle}>{userProgress.tierXp} / 1000 XP</Text>
          </View>
          {!hasPremium && (
            <Pressable onPress={onPurchasePremium} accessibilityLabel="Upgrade button" accessibilityRole="button" accessibilityHint="Activates this control">
              <Badge variant="warning">Upgrade</Badge>
            </Pressable>
          )}
          {hasPremium && <Badge variant="success">Premium Active</Badge>}
        </View>

        {/* XP Progress Bar */}
        <View style={xpBarContainerStyle}>
          <View style={xpBarTrackStyle}>
            <View style={[xpBarFillStyle, { width: `${(userProgress.tierXp / 1000) * 100}%` }]} />
          </View>
        </View>

        {/* Tier Nodes */}
        <View style={tierListStyle}>
          {tiers.slice(0, 10).map((tier) => {
            const isCurrent = tier.tierNumber === currentTierNum;
            const isCompleted = tier.tierNumber < currentTierNum;
            const isUnlocked = tier.tierNumber <= currentTierNum;

            const freeClaimed = userProgress.claimedFreeTiers.includes(tier.tierNumber);
            const premiumClaimed = userProgress.claimedPremiumTiers.includes(tier.tierNumber);

            return (
              <View key={tier.id} style={[tierRowStyle, isCurrent && tierRowCurrentStyle]}>
                {/* Tier Number */}
                <View style={tierNumberContainerStyle}>
                  <Text style={tierNumberStyle}>{tier.tierNumber}</Text>
                </View>

                {/* Free Reward */}
                <View style={rewardContainerStyle}>
                  <View style={[rewardBoxStyle, isCompleted && !freeClaimed && rewardBoxClaimableStyle, freeClaimed && rewardBoxClaimedStyle]}>
                    <Text style={rewardTypeStyle}>Free</Text>
                    <Text style={rewardValueStyle} numberOfLines={1}>
                      {tier.freeRewardType}
                    </Text>
                    {isCompleted && !freeClaimed && (
                      <Pressable onPress={() => onClaimTier?.(tier.tierNumber)} style={claimButtonStyle} accessibilityLabel="Claim button" accessibilityRole="button" accessibilityHint="Activates this control">
                        <Badge variant="success" size="sm">
                          Claim
                        </Badge>
                      </Pressable>
                    )}
                    {freeClaimed && (
                      <Badge variant="secondary" size="sm">
                        Claimed
                      </Badge>
                    )}
                  </View>
                </View>

                {/* Premium Reward */}
                <View style={rewardContainerStyle}>
                  <View style={[rewardBoxStyle, premiumBoxStyle, !hasPremium && premiumBoxLockedStyle, hasPremium && isUnlocked && !premiumClaimed && rewardBoxClaimableStyle, premiumClaimed && rewardBoxClaimedStyle]}>
                    <Text style={rewardTypeStyle}>Premium</Text>
                    <Text style={rewardValueStyle} numberOfLines={1}>
                      {tier.premiumRewardType}
                    </Text>
                    {!hasPremium && (
                      <Badge variant="secondary" size="sm">
                        🔒
                      </Badge>
                    )}
                    {hasPremium && isUnlocked && !premiumClaimed && (
                      <Pressable onPress={() => onClaimTier?.(tier.tierNumber)} style={claimButtonStyle} accessibilityLabel="Claim button" accessibilityRole="button" accessibilityHint="Activates this control">
                        <Badge variant="success" size="sm">
                          Claim
                        </Badge>
                      </Pressable>
                    )}
                    {premiumClaimed && (
                      <Badge variant="secondary" size="sm">
                        Claimed
                      </Badge>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    </ScrollView>
  );
}

const scrollContainerStyle = {
  flex: 1,
};

const containerStyle = {
  padding: 16,
  margin: 16,
};

const skeletonTrackStyle = {
  height: 400,
  backgroundColor: "#E0E0E0",
  borderRadius: 8,
};

const errorContainerStyle = {
  alignItems: "center" as const,
  paddingVertical: 24,
};

const errorTextStyle = {
  marginBottom: 12,
  color: "#DC2626",
};

const emptyTextStyle = {
  textAlign: "center" as const,
  color: "#6B7280",
};

const headerStyle = {
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: 16,
};

const progressInfoStyle = {
  flex: 1,
};

const tierTextStyle = {
  fontSize: 20,
  fontWeight: "700" as const,
};

const xpTextStyle = {
  fontSize: 14,
  color: "#6B7280",
  marginTop: 2,
};

const xpBarContainerStyle = {
  marginBottom: 24,
};

const xpBarTrackStyle = {
  height: 8,
  backgroundColor: "#E5E7EB",
  borderRadius: 4,
};

const xpBarFillStyle = {
  height: "100%" as const,
  backgroundColor: "#4F46E5",
  borderRadius: 4,
};

const tierListStyle = {
  gap: 12,
};

const tierRowStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: "#F3F4F6",
};

const tierRowCurrentStyle = {
  backgroundColor: "#FEF3C7",
  borderRadius: 8,
  paddingHorizontal: 8,
};

const tierNumberContainerStyle = {
  width: 40,
  alignItems: "center" as const,
};

const tierNumberStyle = {
  fontSize: 16,
  fontWeight: "700" as const,
  color: "#374151",
};

const rewardContainerStyle = {
  flex: 1,
  paddingHorizontal: 4,
};

const rewardBoxStyle = {
  padding: 12,
  backgroundColor: "#F3F4F6",
  borderRadius: 8,
  alignItems: "center" as const,
};

const premiumBoxStyle = {
  backgroundColor: "#FDF4FF",
  borderWidth: 1,
  borderColor: "#E9D5FF",
};

const premiumBoxLockedStyle = {
  opacity: 0.5,
};

const rewardBoxClaimableStyle = {
  backgroundColor: "#D1FAE5",
  borderColor: "#10B981",
  borderWidth: 2,
};

const rewardBoxClaimedStyle = {
  backgroundColor: "#E5E7EB",
  opacity: 0.7,
};

const rewardTypeStyle = {
  fontSize: 10,
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  color: "#6B7280",
  marginBottom: 4,
};

const rewardValueStyle = {
  fontSize: 14,
  fontWeight: "500" as const,
  color: "#374151",
  marginBottom: 8,
};

const claimButtonStyle = {
  marginTop: 4,
};
