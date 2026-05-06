/**
 * BossDefeatedScreen Component
 *
 * Full-screen celebration - the biggest win moment in the app.
 * Boss art shatters/explodes with particle effect.
 * "DEFEATED" stamp with shake + settle animation.
 * Shows contributors, damage stats, and defeat reward chest.
 *
 * @phase 3A.1
 */

import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, Dimensions } from "react-native";
import Animated, { FadeIn, FadeInUp, FadeInDown, useAnimatedStyle, withSpring, withSequence, withTiming, withDelay, withRepeat, interpolate, Extrapolation, runOnJS } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface BossDefeatedScreenProps {
  /** Boss name */
  bossName: string;
  /** Boss tier/rarity */
  bossTier: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
  /** Total damage dealt to boss */
  totalDamage: number;
  /** Number of sessions contributed */
  sessionsContributed: number;
  /** Time taken to defeat (in hours) */
  timeTaken: number;
  /** Squad contributors (if squad boss) */
  contributors?: Array<{
    userId: string;
    name: string;
    damage: number;
    avatarUrl?: string;
  }>;
  /** Defeat rewards */
  rewards: {
    xp: number;
    coins: number;
    gems?: number;
    item?: string;
  };
  /** Continue to next screen */
  onContinue: () => void;
  /** Share defeat moment */
  onShare?: () => void;
}

/**
 * Particle for explosion effect
 */
function Particle({ index, total, color }: { index: number; total: number; color: string }): JSX.Element {
  const angle = (index / total) * 2 * Math.PI;
  const distance = 100 + Math.random() * 100;

  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(Math.cos(angle) * distance, {
          damping: 10,
          stiffness: 100,
        }),
      },
      {
        translateY: withSpring(Math.sin(angle) * distance, {
          damping: 10,
          stiffness: 100,
        }),
      },
      {
        scale: withTiming(0, { duration: 1500 }),
      },
    ],
    opacity: withTiming(0, { duration: 1500 }),
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        },
        particleStyle,
      ]}
    />
  );
}

/**
 * Boss shatter/explosion animation
 */
function BossShatter({ bossTier, onShatterComplete }: { bossTier: BossDefeatedScreenProps["bossTier"]; onShatterComplete: () => void }): JSX.Element {
  const { theme } = useTheme();
  const [showParticles, setShowParticles] = useState(false);

  const tierColors = {
    COMMON: theme.colors.text.tertiary,
    UNCOMMON: theme.colors.success.DEFAULT,
    RARE: theme.colors.info.DEFAULT,
    EPIC: theme.colors.accent.purple,
    LEGENDARY: "#F59E0B",
  };

  const bossStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSequence(withTiming(1, { duration: 300 }), withSpring(1.2, { damping: 5, stiffness: 200 }), withTiming(0, { duration: 500 })),
      },
    ],
    opacity: withSequence(withTiming(1, { duration: 300 }), withTiming(1, { duration: 200 }), withTiming(0, { duration: 500 })),
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowParticles(true);
      setTimeout(onShatterComplete, 500);
    }, 500);
    return () => clearTimeout(timer);
  }, [onShatterComplete]);

  return (
    <Box justifyContent="center" alignItems="center" height={200}>
      {/* Boss Icon */}
      <Animated.View
        style={[
          {
            width: 150,
            height: 150,
            borderRadius: 20,
            backgroundColor: `${tierColors[bossTier]}30`,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 3,
            borderColor: tierColors[bossTier],
          },
          bossStyle,
        ]}
      >
        <Text fontSize={80}>👹</Text>
      </Animated.View>

      {/* Explosion Particles */}
      {showParticles && (
        <Box position="absolute" justifyContent="center" alignItems="center" width={150} height={150}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle key={i} index={i} total={20} color={tierColors[bossTier]} />
          ))}
        </Box>
      )}
    </Box>
  );
}

/**
 * DEFEATED stamp animation
 */
function DefeatedStamp(): JSX.Element {
  const stampStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSequence(withTiming(2, { duration: 100 }), withSpring(1, { damping: 8, stiffness: 200 })),
      },
      {
        rotate: withSequence(withTiming("-10deg", { duration: 100 }), withSpring("0deg", { damping: 8, stiffness: 100 })),
      },
    ],
    opacity: withTiming(1, { duration: 300 }),
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(200).delay(1000)}
      style={[
        {
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          borderWidth: 4,
          borderColor: "#22C55E",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
        },
        stampStyle,
      ]}
    >
      <Text fontSize={32} fontWeight="900" color="#22C55E" letterSpacing={4}>
        DEFEATED
      </Text>
    </Animated.View>
  );
}

/**
 * Contributor list (for squad bosses)
 */
function ContributorsList({ contributors }: { contributors: NonNullable<BossDefeatedScreenProps["contributors"]> }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(1500)}>
      <Box p="lg" borderRadius="xl" bg="background.secondary" borderWidth={1} borderColor="border.light" gap="md">
        <Text variant="h4" color="text.primary" textAlign="center">
          Squad Contributors
        </Text>
        {contributors.map((contributor, index) => (
          <Box
            key={contributor.userId}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            py="sm"
            style={{
              borderBottomWidth: index < contributors.length - 1 ? 1 : 0,
              borderBottomColor: theme.colors.border.light,
            }}
          >
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Box width={32} height={32} borderRadius="full" bg="primary.500" justifyContent="center" alignItems="center">
                <Text fontSize={14} color="text.inverse" fontWeight="600">
                  {contributor.name.charAt(0).toUpperCase()}
                </Text>
              </Box>
              <Text variant="body" color="text.primary">
                {contributor.name}
              </Text>
            </Box>
            <Text variant="body" color="text.secondary" fontWeight="600">
              {contributor.damage} dmg
            </Text>
          </Box>
        ))}
      </Box>
    </Animated.View>
  );
}

/**
 * Defeat rewards card
 */
function DefeatRewards({ rewards, bossTier }: { rewards: BossDefeatedScreenProps["rewards"]; bossTier: BossDefeatedScreenProps["bossTier"] }): JSX.Element {
  const { theme } = useTheme();

  const tierMultipliers = {
    COMMON: 1,
    UNCOMMON: 1.5,
    RARE: 2,
    EPIC: 3,
    LEGENDARY: 5,
  };

  const multiplier = tierMultipliers[bossTier];

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(1200)}>
      <Box p="xl" borderRadius="xl" bg={`${theme.colors.accent.purple}15`} borderWidth={2} borderColor="accent.purple" alignItems="center" gap="lg">
        {/* Chest Icon */}
        <Box width={80} height={80} borderRadius="xl" bg={`${theme.colors.accent.purple}30`} justifyContent="center" alignItems="center">
          <Text fontSize={40}>🎁</Text>
        </Box>

        <Text variant="h3" color="text.primary" textAlign="center">
          Boss Defeat Rewards
        </Text>

        {/* XP */}
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={24}>✨</Text>
          <Text variant="h2" color="accent.purple" fontWeight="800">
            +{rewards.xp} XP
          </Text>
          {multiplier > 1 && (
            <Box px="sm" py="xs" borderRadius="full" bg="accent.purple">
              <Text variant="caption" color="text.inverse" fontWeight="700">
                {multiplier}×
              </Text>
            </Box>
          )}
        </Box>

        {/* Coins */}
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={20}>🪙</Text>
          <Text variant="h4" color="text.primary" fontWeight="600">
            +{rewards.coins} coins
          </Text>
        </Box>

        {/* Gems (if any) */}
        {rewards.gems && (
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={20}>💎</Text>
            <Text variant="h4" color="text.primary" fontWeight="600">
              +{rewards.gems} gems
            </Text>
          </Box>
        )}

        {/* Item (if any) */}
        {rewards.item && (
          <Box p="md" borderRadius="lg" bg="background.elevated" borderWidth={1} borderColor="border.light">
            <Text variant="caption" color="text.tertiary">
              ITEM ACQUIRED
            </Text>
            <Text variant="body" color="text.primary" fontWeight="600">
              {rewards.item}
            </Text>
          </Box>
        )}
      </Box>
    </Animated.View>
  );
}

/**
 * Main boss defeated screen
 */
export function BossDefeatedScreen({ bossName, bossTier, totalDamage, sessionsContributed, timeTaken, contributors, rewards, onContinue, onShare }: BossDefeatedScreenProps): JSX.Element {
  const { theme } = useTheme();
  const [showStamp, setShowStamp] = useState(false);

  const handleShatterComplete = useCallback(() => {
    setShowStamp(true);
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background.primary }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Box flex={1} px="xl" py="xl" gap="xl">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <Box alignItems="center" gap="sm">
            <Text variant="label" color="success.DEFAULT">
              🏆 VICTORY
            </Text>
            <Text variant="h1" color="text.primary" textAlign="center">
              {bossName}
            </Text>
            <Text variant="bodyLarge" color="text.secondary" textAlign="center">
              {contributors ? `Your squad defeated ${bossName}!` : `You defeated ${bossName}!`}
            </Text>
          </Box>
        </Animated.View>

        {/* Boss Shatter Animation */}
        <BossShatter bossTier={bossTier} onShatterComplete={handleShatterComplete} />

        {/* DEFEATED Stamp */}
        {showStamp && <DefeatedStamp />}

        {/* Battle Stats */}
        <Animated.View entering={FadeInUp.duration(500).delay(1300)}>
          <Box flexDirection="row" justifyContent="space-around" p="lg" borderRadius="xl" bg="background.secondary">
            <Box alignItems="center">
              <Text variant="h3" color="text.primary" fontWeight="700">
                {totalDamage}
              </Text>
              <Text variant="caption" color="text.tertiary">
                Total Damage
              </Text>
            </Box>
            <Box alignItems="center">
              <Text variant="h3" color="text.primary" fontWeight="700">
                {sessionsContributed}
              </Text>
              <Text variant="caption" color="text.tertiary">
                Sessions
              </Text>
            </Box>
            <Box alignItems="center">
              <Text variant="h3" color="text.primary" fontWeight="700">
                {timeTaken}h
              </Text>
              <Text variant="caption" color="text.tertiary">
                Time Taken
              </Text>
            </Box>
          </Box>
        </Animated.View>

        {/* Contributors (if squad) */}
        {contributors && contributors.length > 0 && <ContributorsList contributors={contributors} />}

        {/* Rewards */}
        <DefeatRewards rewards={rewards} bossTier={bossTier} />

        {/* Share Button */}
        {onShare && (
          <Animated.View entering={FadeInUp.duration(500).delay(1600)}>
            <Button variant="secondary" size="lg" fullWidth onPress={onShare} accessibilityLabel="📤 Share Victory button" accessibilityRole="button" accessibilityHint="Activates this control">
              📤 Share Victory
            </Button>
          </Animated.View>
        )}

        {/* Continue Button */}
        <Animated.View entering={FadeInUp.duration(500).delay(1700)}>
          <Button variant="primary" size="lg" fullWidth onPress={onContinue} accessibilityLabel="Continue → button" accessibilityRole="button" accessibilityHint="Activates this control">
            Continue →
          </Button>
        </Animated.View>
      </Box>
    </ScrollView>
  );
}

export default BossDefeatedScreen;
