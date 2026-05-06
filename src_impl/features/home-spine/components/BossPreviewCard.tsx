/**
 * BossPreviewCard Component
 *
 * Mini boss card for home screen showing active boss encounter.
 * Displays boss name, health bar, time remaining, and estimated damage.
 *
 * @phase 1A.5
 */

import React, { useMemo } from "react";
import { Pressable } from "react-native";
import Animated, { FadeIn, FadeInUp, useAnimatedStyle, withTiming, withSpring, useSharedValue, withDelay, withRepeat, withSequence } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import * as Haptics from "../../../utils/haptics";

export interface BossPreviewCardProps {
  /** Boss name */
  bossName: string;
  /** Boss health percentage (0-100) */
  healthPercent: number;
  /** Hours remaining until boss escapes */
  hoursRemaining: number;
  /** Estimated damage this session would deal */
  estimatedDamage?: number;
  /** Boss tier/rarity */
  tier: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
  /** Boss avatar/icon URL */
  bossIcon?: string;
  /** Whether this session would defeat the boss */
  wouldDefeat?: boolean;
  /** Navigate to boss detail screen */
  onPress?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** PHASE 7.3: Final Strike mode (1-15% health) - triggers urgent UI */
  isFinalStrike?: boolean;
  /** PHASE 12.1: Boss taunt message based on health */
  taunt?: string;
  /** Boss Bounty — Phase 4 */
  activeBountyCount?: number;
  maxBounties?: number;
  onPlaceBounty?: () => void;
  isPlacingBounty?: boolean;
  bountyError?: string | null;
  coinBalance?: number;
  BOUNTY_COST?: number;
}

/**
 * Skeleton loading state
 */
function BossPreviewSkeleton(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box m="lg" p="lg" borderRadius="xl" bg={theme.colors.background.secondary}>
      <Box flexDirection="row" alignItems="center" gap="md">
        <Box width={56} height={56} borderRadius="lg" bg={theme.colors.background.tertiary} />
        <Box gap="sm" flex={1}>
          <Box width={120} height={18} borderRadius="sm" bg={theme.colors.background.tertiary} />
          <Box width="100%" height={8} borderRadius="full" bg={theme.colors.background.tertiary} />
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Boss tier badge with color coding
 */
function TierBadge({ tier }: { tier: BossPreviewCardProps["tier"] }): JSX.Element {
  const { theme } = useTheme();

  const tierConfig = useMemo(() => {
    switch (tier) {
      case "LEGENDARY":
        return {
          color: "#F59E0B", // Amber
          bg: "rgba(245, 158, 11, 0.2)",
          label: "LEGENDARY",
        };
      case "EPIC":
        return {
          color: "#A855F7", // Purple
          bg: "rgba(168, 85, 247, 0.2)",
          label: "EPIC",
        };
      case "RARE":
        return {
          color: "#3B82F6", // Blue
          bg: "rgba(59, 130, 246, 0.2)",
          label: "RARE",
        };
      case "UNCOMMON":
        return {
          color: "#22C55E", // Green
          bg: "rgba(34, 197, 94, 0.2)",
          label: "UNCOMMON",
        };
      default:
        return {
          color: theme.colors.text.tertiary,
          bg: theme.colors.background.tertiary,
          label: "COMMON",
        };
    }
  }, [tier, theme]);

  return (
    <Box px="sm" py="xs" borderRadius="full" bg={tierConfig.bg} borderWidth={1} borderColor={tierConfig.color}>
      <Text variant="caption" color={tierConfig.color} fontWeight="700" fontSize={10}>
        {tierConfig.label}
      </Text>
    </Box>
  );
}

/**
 * Boss taunt speech bubble - PHASE 12.1
 */
function BossTauntBubble({ taunt }: { taunt: string }): JSX.Element {
  const { theme } = useTheme();

  const slideStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(0, { damping: 15, stiffness: 100 }),
      },
    ],
    opacity: withTiming(1, { duration: 400 }),
  }));

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(300)} style={slideStyle}>
      <Box
        position="absolute"
        top={-60}
        right={0}
        maxWidth={200}
        px="md"
        py="sm"
        borderRadius="lg"
        bg={`${theme.colors.error[500]}15`}
        borderWidth={1}
        borderColor={theme.colors.error[500]}
        style={{
          shadowColor: theme.colors.error[500],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text variant="caption" color={theme.colors.error[500]} fontWeight="500">
          💬 {taunt}
        </Text>
        {/* Speech bubble pointer */}
        <Box
          position="absolute"
          bottom={-8}
          right={20}
          width={0}
          height={0}
          style={{
            borderLeftWidth: 8,
            borderRightWidth: 8,
            borderTopWidth: 8,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: theme.colors.error[500],
          }}
        />
      </Box>
    </Animated.View>
  );
}

/**
 * Animated health bar
 */
function HealthBar({ healthPercent, animated = true }: { healthPercent: number; animated?: boolean }): JSX.Element {
  const { theme } = useTheme();
  const progressValue = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      progressValue.value = withDelay(300, withSpring(healthPercent / 100, { damping: 15, stiffness: 100 }));
    } else {
      progressValue.value = healthPercent / 100;
    }
  }, [healthPercent, animated, progressValue]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  const getHealthColor = () => {
    if (healthPercent <= 15) {
      return theme.colors.error.DEFAULT;
    }
    if (healthPercent <= 30) {
      return theme.colors.warning.DEFAULT;
    }
    if (healthPercent <= 50) {
      return theme.colors.accent.orange;
    }
    return theme.colors.success.DEFAULT;
  };

  return (
    <Box>
      <Box
        accessibilityLabel={`Boss health: ${healthPercent.toFixed(0)} percent`}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(healthPercent),
          text: `${healthPercent.toFixed(0)} percent`,
        }}
        accessible
        height={8}
        borderRadius="full"
        bg={theme.colors.background.tertiary}
        overflow="hidden"
      >
        <Animated.View
          style={[
            {
              height: "100%",
              borderRadius: 4,
              backgroundColor: getHealthColor(),
            },
            barStyle,
          ]}
        />
      </Box>
      <Box flexDirection="row" justifyContent="space-between" mt="xs">
        <Text variant="caption" color="text.tertiary">
          {healthPercent.toFixed(0)}% health
        </Text>
        {healthPercent <= 20 && (
          <Text variant="caption" color={theme.colors.error.DEFAULT} fontWeight="600">
            FINISH HIM!
          </Text>
        )}
      </Box>
    </Box>
  );
}

/**
 * Boss escape timer with urgency states
 */
function EscapeTimer({ hoursRemaining }: { hoursRemaining: number }): JSX.Element {
  const { theme } = useTheme();

  const isUrgent = hoursRemaining <= 6;
  const isWarning = hoursRemaining <= 12;

  return (
    <Box flexDirection="row" alignItems="center" gap="xs">
      <Text fontSize={12}>⏰</Text>
      <Text variant="caption" color={isUrgent ? theme.colors.error.DEFAULT : isWarning ? theme.colors.warning.DEFAULT : "text.tertiary"} fontWeight={isUrgent ? "600" : "400"}>
        {isUrgent ? "🚨 " : ""}
        Escapes in {hoursRemaining}h
      </Text>
    </Box>
  );
}

/**
 * Defeat celebration indicator
 */
function DefeatIndicator(): JSX.Element {
  const { theme } = useTheme();

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(withSpring(1.2, { damping: 2, stiffness: 200 }), -1, true),
      },
    ],
  }));

  return (
    <Animated.View style={bounceStyle}>
      <Box px="sm" py="xs" borderRadius="lg" bg={`${theme.colors.success[500]}20`} borderWidth={1} borderColor={theme.colors.success[500]}>
        <Text variant="caption" color={theme.colors.success[500]} fontWeight="700">
          ⚔️ DEFEAT IMMINENT
        </Text>
      </Box>
    </Animated.View>
  );
}

/**
 * PHASE 7.3: Final Strike indicator - shown when boss is 1-15% health
 */
function FinalStrikeIndicator(): JSX.Element {
  const { theme } = useTheme();

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(withSequence(withSpring(1, { damping: 3, stiffness: 200 }), withSpring(1.1, { damping: 3, stiffness: 200 })), -1, true),
      },
    ],
    opacity: withRepeat(withSequence(withTiming(1, { duration: 500 }), withTiming(0.7, { duration: 500 })), -1, true),
  }));

  return (
    <Animated.View style={pulseStyle}>
      <Box px="sm" py="xs" borderRadius="lg" bg={`${theme.colors.error[500]}25`} borderWidth={2} borderColor={theme.colors.error[500]}>
        <Text variant="caption" color={theme.colors.error[500]} fontWeight="800">
          ⚔️ FINAL STRIKE AVAILABLE
        </Text>
      </Box>
    </Animated.View>
  );
}

/**
 * Main boss preview card component
 */
export function BossPreviewCard({ bossName, healthPercent, hoursRemaining, estimatedDamage, tier, wouldDefeat, onPress, isLoading = false, isFinalStrike = false, taunt, activeBountyCount, maxBounties = 4, onPlaceBounty, isPlacingBounty = false, bountyError = null, coinBalance, BOUNTY_COST = 50 }: BossPreviewCardProps): JSX.Element {
  const { theme } = useTheme();

  if (isLoading) {
    return <BossPreviewSkeleton />;
  }

  const isNearDeath = healthPercent <= 15;
  const showFinalStrike = isFinalStrike || (isNearDeath && !wouldDefeat);

  return (
    <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
      <Animated.View entering={FadeIn.duration(400).delay(200)}>
        <Box
          m="lg"
          p="lg"
          borderRadius="xl"
          bg={theme.colors.background.secondary}
          borderWidth={showFinalStrike ? 3 : isNearDeath ? 2 : 1}
          borderColor={showFinalStrike ? theme.colors.error[500] : wouldDefeat ? theme.colors.success[500] : theme.colors.border.DEFAULT}
          style={
            showFinalStrike
              ? {
                  shadowColor: theme.colors.error[500],
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 8,
                }
              : undefined
          }
        >
          {/* PHASE 12.1: Boss Taunt Speech Bubble */}
          {taunt && <BossTauntBubble taunt={taunt} />}

          {/* Header: Icon + Name + Tier */}
          <Box flexDirection="row" alignItems="center" gap="md" mb="md">
            {/* Boss Icon Placeholder */}
            <Box width={56} height={56} borderRadius="lg" bg={theme.colors.background.tertiary} justifyContent="center" alignItems="center" borderWidth={showFinalStrike ? 2 : 1} borderColor={showFinalStrike ? theme.colors.error[500] : theme.colors.border.DEFAULT}>
              <Text fontSize={28}>{showFinalStrike ? "🔥" : "👹"}</Text>
            </Box>

            <Box flex={1} gap="xs">
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Text variant="h4" color="text.primary" numberOfLines={1}>
                  {showFinalStrike ? `⚔️ ${bossName}` : bossName}
                </Text>
              </Box>
              <TierBadge tier={tier} />
            </Box>

            {showFinalStrike && <FinalStrikeIndicator />}
            {!showFinalStrike && wouldDefeat && <DefeatIndicator />}
          </Box>

          {/* Health Bar */}
          <HealthBar healthPercent={healthPercent} />

          {/* Footer: Timer + Damage */}
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" mt="md">
            <EscapeTimer hoursRemaining={hoursRemaining} />

            {estimatedDamage && estimatedDamage > 0 && (
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Text fontSize={12}>⚔️</Text>
                <Text variant="caption" color="text.secondary">
                  ~{estimatedDamage} dmg this session
                </Text>
              </Box>
            )}
          </Box>

          {/* Bounty Section — Phase 4 */}
          {onPlaceBounty && (
            <Box mt="sm" pt="sm" borderTopWidth={1} borderTopColor="border.subtle" flexDirection="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Text variant="caption" color="text.secondary">
                  🎯 Boss Bounty
                </Text>
                {activeBountyCount !== undefined && activeBountyCount > 0 ? (
                  <Text variant="caption" color="warning.500" fontWeight="600">
                    {activeBountyCount}× active — 2× loot next session
                  </Text>
                ) : (
                  <Text variant="caption" color="text.tertiary">
                    50 coins for 2× loot chance
                  </Text>
                )}
              </Box>

              <Pressable
                onPress={() => {
                  void Haptics.triggerHaptic("impactLight");
                  onPlaceBounty?.();
                }}
                disabled={isPlacingBounty || (coinBalance !== undefined && coinBalance < BOUNTY_COST) || (activeBountyCount !== undefined && activeBountyCount >= maxBounties)}
                style={{
                  backgroundColor: theme.colors.warning[500],
                  borderRadius: theme.borderRadius.md,
                  paddingVertical: theme.spacing[2],
                  paddingHorizontal: theme.spacing[3],
                  opacity: isPlacingBounty ? 0.6 : 1,
                }}
                accessibilityLabel="Place boss bounty for 50 coins"
                accessibilityRole="button"
                accessibilityHint="Doubles your loot chance from the next session that damages this boss"
              >
                <Text variant="caption" fontWeight="600" color="background.primary">
                  {isPlacingBounty ? "..." : "50 🪙"}
                </Text>
              </Pressable>
            </Box>
          )}

          {bountyError && (
            <Text variant="caption" color="error.500" mt="xs">
              {bountyError}
            </Text>
          )}
        </Box>
      </Animated.View>
    </Pressable>
  );
}

export default BossPreviewCard;
