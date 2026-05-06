/**
 * BossWarCard Component
 *
 * Shows squad vs boss war progress with time remaining.
 * "Your squad vs Boss X — 6h remaining"
 *
 * @phase 5.2
 */

import React from "react";
import { Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";
import { BossAvatar } from "../../boss/components/BossAvatar";

export interface BossWarCardProps {
  /** Boss name */
  bossName: string;
  /** Boss tier */
  bossTier: "NORMAL" | "ELITE" | "LEGENDARY";
  /** Boss health remaining (0-100%) */
  bossHealthPercent: number;
  /** Hours remaining in war */
  hoursRemaining: number;
  /** Squad damage dealt so far */
  squadDamage: number;
  /** Your contribution */
  userContribution: number;
  /** Number of squad members participating */
  participantCount: number;
  /** Called when user taps to join war */
  onJoinWar: () => void;
  /** Called when user taps to view details */
  onViewDetails?: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Format hours remaining into readable string
 */
function formatTimeRemaining(hours: number): string {
  if (hours <= 0) {
    return "Ending soon!";
  }
  if (hours < 1) {
    return "Less than 1h";
  }
  if (hours === 1) {
    return "1h remaining";
  }
  if (hours < 24) {
    return `${Math.floor(hours)}h remaining`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} left`;
}

/**
 * Get tier color
 */
function getTierColor(tier: BossWarCardProps["bossTier"]): string {
  switch (tier) {
    case "LEGENDARY":
      return "#F59E0B"; // Orange/Gold
    case "ELITE":
      return "#8B5CF6"; // Purple
    default:
      return "#3B82F6"; // Blue
  }
}

export function BossWarCard({ bossName, bossTier, bossHealthPercent, hoursRemaining, squadDamage, userContribution, participantCount, onJoinWar, onViewDetails, isLoading = false }: BossWarCardProps): JSX.Element | null {
  const { theme } = useTheme();

  const tierColor = getTierColor(bossTier);
  const isUrgent = hoursRemaining < 4;
  const isCritical = bossHealthPercent < 10;

  if (isLoading) {
    return (
      <Box mx="lg" mb="md" p="lg" borderRadius="xl" bg={theme.colors.background.tertiary}>
        <Box height={20} width="60%" bg={theme.colors.background.secondary} borderRadius="sm" />
        <Box height={80} width="100%" bg={theme.colors.background.secondary} borderRadius="lg" mt="md" />
      </Box>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(200)}>
      <Pressable onPress={onViewDetails} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box
          mx="lg"
          mb="md"
          p="lg"
          borderRadius="xl"
          bg={theme.colors.background.secondary}
          borderWidth={2}
          borderColor={isCritical ? theme.colors.error.DEFAULT : tierColor}
          style={{
            shadowColor: tierColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isUrgent ? 0.4 : 0.2,
            shadowRadius: isUrgent ? 16 : 8,
            elevation: isUrgent ? 6 : 3,
          }}
        >
          {/* Header */}
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="md">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Box px="sm" py="xs" borderRadius="md" bg={`${tierColor}20`} borderWidth={1} borderColor={tierColor}>
                <Text variant="caption" color={tierColor} fontWeight="700">
                  {bossTier}
                </Text>
              </Box>
              <Text variant="caption" color={isUrgent ? theme.colors.error.DEFAULT : theme.colors.text.secondary} fontWeight={isUrgent ? "600" : "400"}>
                {isUrgent ? "⏰ " : ""}
                {formatTimeRemaining(hoursRemaining)}
              </Text>
            </Box>
            <Text variant="caption" color="text.tertiary">
              {participantCount} fighters
            </Text>
          </Box>

          {/* Boss Info */}
          <Box flexDirection="row" alignItems="center" gap="md" mb="md">
            <Box width={64} height={64} borderRadius="lg" bg={`${tierColor}15`} justifyContent="center" alignItems="center">
              <BossAvatar bossName={bossName} size={48} primaryColor={tierColor} secondaryColor={theme.colors.background.secondary} glowColor={tierColor} />
            </Box>

            <Box flex={1}>
              <Text variant="h4" color="text.primary" fontWeight="700">
                {bossName}
              </Text>
              <Text variant="caption" color="text.secondary">
                Your squad is fighting
              </Text>
            </Box>

            {/* Health indicator */}
            <Box alignItems="center">
              <Text variant="h3" color={bossHealthPercent < 25 ? theme.colors.error.DEFAULT : tierColor} fontWeight="800">
                {Math.round(bossHealthPercent)}%
              </Text>
              <Text variant="caption" color="text.tertiary">
                HP left
              </Text>
            </Box>
          </Box>

          {/* Boss health bar */}
          <Box mb="md">
            <Box height={12} borderRadius="full" bg={theme.colors.background.tertiary} overflow="hidden">
              <Box
                width={`${bossHealthPercent}%`}
                height="100%"
                borderRadius="full"
                bg={bossHealthPercent < 25 ? theme.colors.error.DEFAULT : tierColor}
                style={{
                  shadowColor: bossHealthPercent < 25 ? theme.colors.error.DEFAULT : tierColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                }}
              />
            </Box>
          </Box>

          {/* Damage stats */}
          <Box flexDirection="row" justifyContent="space-between" p="md" borderRadius="lg" bg={theme.colors.background.primary} mb="md">
            <Box alignItems="center">
              <Text variant="h4" color="text.primary" fontWeight="700">
                {squadDamage.toLocaleString()}
              </Text>
              <Text variant="caption" color="text.tertiary">
                Squad DMG
              </Text>
            </Box>

            <Box width={1} height="100%" bg={theme.colors.border.light} />

            <Box alignItems="center">
              <Text variant="h4" color={theme.colors.primary[500]} fontWeight="700">
                {userContribution.toLocaleString()}
              </Text>
              <Text variant="caption" color="text.tertiary">
                Your DMG
              </Text>
            </Box>
          </Box>

          {/* CTA */}
          <Button variant={isCritical ? "primary" : "secondary"} size="lg" fullWidth onPress={onJoinWar} accessibilityLabel="Action button" accessibilityRole="button" accessibilityHint="Activates this control">
            {isCritical ? "⚔️ Join Final Push!" : "⚔️ Join War"}
          </Button>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

export default BossWarCard;
