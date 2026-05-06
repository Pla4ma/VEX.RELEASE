/**
 * Premium Preview Component
 *
 * FOMO battle pass preview for free users.
 * Shows premium track rewards blurred/locked to create desire.
 * "What you're missing" creates FOMO without being aggressive.
 *
 * Passes the test: "Would a free user feel like they're missing out?"
 * Answer: YES — they can see exactly what they're not getting.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, View, ScrollView, Dimensions } from "react-native";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, interpolate, Extrapolation } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";
import { capture } from "../../../shared/analytics";
import { EconomyEvents } from "../../../shared/analytics/analytics-events";
import { usePremiumStatus } from "../../../shared/monetization";
import { createSheet } from "@/shared/ui/create-sheet";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Premium gradient
const PREMIUM_GRADIENT = ["#A855F7", "#EC4899", "#F59E0B"] as const;
const PREMIUM_GOLD = "#FFD700";

interface PremiumReward {
  tier: number;
  name: string;
  icon: string;
  type: "gems" | "coins" | "item" | "badge" | "exclusive";
  value: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface PremiumPreviewProps {
  /** Current tier progress (free track) */
  currentTier: number;
  /** Total premium tiers unlocked but not claimed (retroactive) */
  unlockedPremiumTiers: number;
  /** Sample of upcoming premium rewards */
  upcomingRewards: PremiumReward[];
  /** Callback to upgrade to premium */
  onUpgrade: () => void;
  /** Days remaining in season */
  daysRemaining: number;
  /** Whether user has premium */
  hasPremium?: boolean;
}

export function PremiumPreview({ currentTier, unlockedPremiumTiers, upcomingRewards, onUpgrade, daysRemaining, hasPremium = false }: PremiumPreviewProps): JSX.Element | null {
  const { theme } = useTheme();
  const { colors } = theme;
  const { isPremium } = usePremiumStatus();

  // Don't show for premium users
  if (isPremium || hasPremium) {
    return null;
  }

  // Pulsing animation for "Upgrade" CTA
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(withSequence(withTiming(1.05, { duration: 1200 }), withTiming(1, { duration: 1200 })), -1, true);
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Calculate retroactive value
  const retroactiveValue = useMemo(() => {
    // Estimate: 50 gems per tier average
    const gemsValue = unlockedPremiumTiers * 50;
    return gemsValue;
  }, [unlockedPremiumTiers]);

  const handleUpgrade = () => {
    capture(EconomyEvents.PAYWALL_VIEWED, {
      source: "battle_pass_preview",
      paywall_source: "battle_pass",
      amount: retroactiveValue,
    });
    onUpgrade();
  };

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.headerCard}>
        <LinearGradient colors={[...PREMIUM_GRADIENT]} style={styles.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.headerContent}>
            <View style={styles.crownContainer}>
              <Text style={styles.crownEmoji}>👑</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Premium Track Locked</Text>
              <Text style={styles.headerSubtitle}>{unlockedPremiumTiers > 0 ? `${unlockedPremiumTiers} tiers earned but locked!` : "Unlock 2x rewards on every tier"}</Text>
            </View>
          </View>

          {/* Urgency badge */}
          {daysRemaining <= 7 && (
            <View style={styles.urgencyBadge}>
              <Text style={styles.urgencyText}>⚠️ {daysRemaining} days left</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Retroactive Value Banner */}
      {unlockedPremiumTiers > 0 && (
        <Animated.View entering={FadeIn.duration(400).delay(100)} style={[styles.retroBanner, { backgroundColor: "rgba(255, 215, 0, 0.12)" }]}>
          <Text style={styles.retroIcon}>💎</Text>
          <View style={styles.retroText}>
            <Text variant="body" fontWeight="700" color="text.primary">
              You've already unlocked {unlockedPremiumTiers} premium tiers!
            </Text>
            <Text variant="bodySmall" color="text.secondary">
              {retroactiveValue}+ gems waiting to be claimed
            </Text>
          </View>
        </Animated.View>
      )}

      {/* "What you're missing" Label */}
      <View style={styles.missingLabel}>
        <View style={[styles.missingLine, { backgroundColor: colors.border.DEFAULT }]} />
        <Text variant="caption" color="text.tertiary" style={styles.missingText}>
          WHAT YOU'RE MISSING
        </Text>
        <View style={[styles.missingLine, { backgroundColor: colors.border.DEFAULT }]} />
      </View>

      {/* Blurred Premium Rewards Preview */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rewardsScroll}>
        {upcomingRewards.map((reward, index) => (
          <BlurRewardCard key={reward.tier} reward={reward} index={index} currentTier={currentTier} />
        ))}
      </ScrollView>

      {/* FOMO Stats */}
      <View style={[styles.statsRow, { backgroundColor: colors.background.secondary }]}>
        <View style={styles.stat}>
          <Text variant="h3" fontSize={24} color={PREMIUM_GOLD}>
            100+
          </Text>
          <Text variant="caption" color="text.tertiary">
            Premium Items
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border.DEFAULT }]} />
        <View style={styles.stat}>
          <Text variant="h3" fontSize={24} color={PREMIUM_GOLD}>
            2,500+
          </Text>
          <Text variant="caption" color="text.tertiary">
            Gems Value
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border.DEFAULT }]} />
        <View style={styles.stat}>
          <Text variant="h3" fontSize={24} color={PREMIUM_GOLD}>
            Exclusive
          </Text>
          <Text variant="caption" color="text.tertiary">
            Legendary Items
          </Text>
        </View>
      </View>

      {/* Upgrade CTA */}
      <Animated.View style={[styles.ctaContainer, pulseStyle]}>
        <Button
          onPress={handleUpgrade}
          variant="primary"
          size="lg"
          fullWidth
          haptic="success"
          style={{
            backgroundColor: PREMIUM_GOLD,
          }}
          accessibilityLabel="+ Gems Now` : 'Unlock Premium Track'} button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          {unlockedPremiumTiers > 0 ? `Claim ${retroactiveValue}+ Gems Now` : "Unlock Premium Track"}
        </Button>

        {unlockedPremiumTiers > 0 && (
          <Text variant="caption" color="text.tertiary" style={styles.ctaSubtext}>
            Retroactive rewards expire in {daysRemaining} days
          </Text>
        )}
      </Animated.View>

      {/* Trust indicators */}
      <View style={styles.trustRow}>
        <Text variant="caption" color="text.tertiary" style={styles.trustText}>
          ⚡ Instant unlock • 🔄 Auto-applies to all tiers
        </Text>
      </View>
    </View>
  );
}

// Blurred reward card component
interface BlurRewardCardProps {
  reward: PremiumReward;
  index: number;
  currentTier: number;
}

function BlurRewardCard({ reward, index, currentTier }: BlurRewardCardProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const blurAmount = useSharedValue(0);
  const lockScale = useSharedValue(1);

  React.useEffect(() => {
    // Animate blur intensity
    blurAmount.value = withRepeat(withSequence(withTiming(8, { duration: 2000 }), withTiming(12, { duration: 2000 })), -1, true);
  }, [blurAmount]);

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(blurAmount.value, [0, 20], [0.3, 0.7], Extrapolation.CLAMP),
  }));

  // Rarity colors
  const rarityColors = {
    common: "#94A3B8",
    rare: "#3B82F6",
    epic: "#A855F7",
    legendary: "#FFD700",
  };

  const isLocked = reward.tier > currentTier;

  return (
    <Animated.View
      entering={FadeIn.duration(300).delay(index * 100)}
      style={[
        styles.rewardCard,
        {
          backgroundColor: colors.background.secondary,
          borderColor: rarityColors[reward.rarity],
          borderWidth: 2,
          opacity: isLocked ? 0.6 : 0.8,
        },
      ]}
    >
      {/* Blur overlay */}
      <Animated.View style={[styles.blurOverlay, blurStyle, { backgroundColor: colors.background.primary }]} />

      {/* Content (partially visible through blur) */}
      <View style={styles.rewardContent}>
        <Text style={styles.rewardIcon}>{reward.icon}</Text>
        <Text variant="caption" fontWeight="600" color="text.secondary" style={styles.rewardName}>
          Tier {reward.tier}
        </Text>
        <Text variant="bodySmall" fontWeight="700" color={rarityColors[reward.rarity]}>
          {reward.rarity.toUpperCase()}
        </Text>
      </View>

      {/* Lock icon */}
      <View style={styles.lockContainer}>
        <View style={[styles.lockCircle, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
        <Text variant="caption" color="text.inverse" style={styles.lockText}>
          {isLocked ? `Reach Tier ${reward.tier}` : "Premium"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    padding: 16,
    gap: 16,
  },
  headerCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  headerGradient: {
    padding: 20,
    gap: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  crownContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  crownEmoji: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
  },
  urgencyBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  urgencyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  retroBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  retroIcon: {
    fontSize: 24,
  },
  retroText: {
    flex: 1,
    gap: 2,
  },
  missingLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  missingLine: {
    flex: 1,
    height: 1,
  },
  missingText: {
    fontWeight: "700",
    letterSpacing: 1,
  },
  rewardsScroll: {
    gap: 12,
    paddingVertical: 8,
  },
  rewardCard: {
    width: 120,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  rewardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
  },
  rewardIcon: {
    fontSize: 32,
    opacity: 0.5,
  },
  rewardName: {
    textAlign: "center",
  },
  lockContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    gap: 8,
  },
  lockCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  lockIcon: {
    fontSize: 20,
  },
  lockText: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 4,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 16,
    borderRadius: 16,
  },
  stat: {
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  ctaContainer: {
    gap: 8,
  },
  ctaSubtext: {
    textAlign: "center",
  },
  trustRow: {
    alignItems: "center",
  },
  trustText: {
    textAlign: "center",
  },
});

export default PremiumPreview;
