/**
 * BossTierGate Component
 *
 * PHASE 12.4 - Boss tier progression gate
 * Shows locked state for boss tiers based on mastery rank requirements:
 * - Tiers 1-2: Available at Level 1 (APPRENTICE)
 * - Tiers 3-4: Requires ADEPT mastery rank
 * - Tiers 5-6: Requires EXPERT mastery rank
 *
 * @phase 12.4
 */

import React from "react";
import { Pressable } from "react-native";

import { Box, Card, Text } from "../../../components/primitives";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";
import { getMasteryRankDisplay, type MasteryRank } from "../../mastery/types";

// Mastery rank requirements for boss tiers
const TIER_REQUIREMENTS: Record<number, MasteryRank> = {
  1: "APPRENTICE",
  2: "APPRENTICE",
  3: "ADEPT",
  4: "ADEPT",
  5: "EXPERT",
  6: "EXPERT",
};

const RANK_ORDER: MasteryRank[] = ["APPRENTICE", "ADEPT", "EXPERT", "MASTER", "GRANDMASTER"];

export interface BossTierGateProps {
  /** Boss tier number (1-6) */
  tier: number;
  /** User's current mastery rank */
  userRank: MasteryRank;
  /** Children to render if unlocked */
  children: React.ReactNode;
  /** Callback to navigate to mastery screen */
  onNavigateToMastery?: () => void;
}

/**
 * Check if a boss tier is unlocked for the user
 */
export function isBossTierUnlocked(tier: number, userRank: MasteryRank): boolean {
  const requiredRank = TIER_REQUIREMENTS[tier];
  if (!requiredRank) {
    return false;
  }

  const userRankIndex = RANK_ORDER.indexOf(userRank);
  const requiredRankIndex = RANK_ORDER.indexOf(requiredRank);

  return userRankIndex >= requiredRankIndex;
}

/**
 * Get the required mastery rank for a boss tier
 */
export function getRequiredRankForTier(tier: number): MasteryRank {
  return TIER_REQUIREMENTS[tier] || "APPRENTICE";
}

/**
 * Get display text for tier availability
 */
export function getTierAvailabilityText(tier: number): string {
  const requiredRank = TIER_REQUIREMENTS[tier];
  if (!requiredRank || requiredRank === "APPRENTICE") {
    return "Available now";
  }
  const rankDisplay = getMasteryRankDisplay(requiredRank);
  return `Requires ${rankDisplay.title} Mastery`;
}

export function BossTierGate({ tier, userRank, children, onNavigateToMastery }: BossTierGateProps): JSX.Element {
  const { theme } = useTheme();
  const isUnlocked = isBossTierUnlocked(tier, userRank);
  const requiredRank = getRequiredRankForTier(tier);
  const rankDisplay = getMasteryRankDisplay(requiredRank);

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <Card
      size="md"
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderWidth: 2,
        borderColor: `${rankDisplay.color}40`,
        borderStyle: "dashed",
        opacity: 0.9,
      }}
    >
      <Box alignItems="center" gap="md">
        {/* Lock Icon */}
        <Box width={56} height={56} borderRadius="full" bg={`${rankDisplay.color}20`} justifyContent="center" alignItems="center">
          <Text fontSize={28}>🔒</Text>
        </Box>

        {/* Tier Info */}
        <Box alignItems="center">
          <Text variant="h4" color="text.primary" textAlign="center">
            Tier {tier} Bosses Locked
          </Text>
          <Text variant="bodySmall" color="text.secondary" textAlign="center" mt="xs">
            Defeat lower tier bosses and master your focus technique
          </Text>
        </Box>

        {/* Required Rank */}
        <Box flexDirection="row" alignItems="center" gap="sm" px="md" py="sm" borderRadius="lg" bg={`${rankDisplay.color}15`}>
          <Text fontSize={20}>{rankDisplay.icon}</Text>
          <Box>
            <Text variant="caption" color="text.secondary">
              Required Mastery Rank
            </Text>
            <Text variant="bodySmall" color={rankDisplay.color} fontWeight="600">
              {rankDisplay.title}
            </Text>
          </Box>
        </Box>

        {/* CTA */}
        {onNavigateToMastery && (
          <Button size="sm" variant="outline" onPress={onNavigateToMastery} accessibilityLabel="View mastery progression" accessibilityRole="button" accessibilityHint="Activates this control">
            View Mastery Progress
          </Button>
        )}

        {/* Unlock Benefit */}
        <Box flexDirection="row" alignItems="center" gap="xs" px="sm" py="xs" borderRadius="md" bg="background.tertiary">
          <Text fontSize={12}>✨</Text>
          <Text variant="caption" color="success.DEFAULT">
            Unlock: {tier <= 4 ? "Rare boss drops" : "Legendary boss drops"}
          </Text>
        </Box>
      </Box>
    </Card>
  );
}

export interface LockedBossCardProps {
  tier: number;
  bossName: string;
  userRank: MasteryRank;
  onNavigateToMastery?: () => void;
}

export function LockedBossCard({ tier, bossName, userRank: _userRank, onNavigateToMastery }: LockedBossCardProps): JSX.Element {
  const { theme } = useTheme();
  const requiredRank = getRequiredRankForTier(tier);
  const rankDisplay = getMasteryRankDisplay(requiredRank);

  return (
    <Pressable onPress={onNavigateToMastery} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
      <Card
        size="sm"
        style={{
          backgroundColor: theme.colors.background.secondary,
          opacity: 0.7,
        }}
      >
        <Box flexDirection="row" alignItems="center" gap="md">
          <Box width={48} height={48} borderRadius="lg" bg={`${rankDisplay.color}20`} justifyContent="center" alignItems="center">
            <Text fontSize={24}>🔒</Text>
          </Box>

          <Box flex={1}>
            <Text variant="body" color="text.primary" fontWeight="600">
              {bossName}
            </Text>
            <Text variant="caption" color="text.tertiary">
              Tier {tier} • Locked
            </Text>
          </Box>

          <Box px="sm" py="xs" borderRadius="md" bg={`${rankDisplay.color}15`}>
            <Text variant="caption" color={rankDisplay.color}>
              {rankDisplay.title}
            </Text>
          </Box>
        </Box>
      </Card>
    </Pressable>
  );
}

export default BossTierGate;
