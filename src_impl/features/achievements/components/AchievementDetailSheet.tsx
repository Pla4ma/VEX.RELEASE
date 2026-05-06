/**
 * AchievementDetailSheet
 *
 * Bottom sheet showing detailed achievement information.
 * Includes large icon, full title, description, rarity badge,
 * unlock conditions, share button, and special handling for hidden achievements.
 */

import React, { useCallback, useMemo } from "react";
import { View, Pressable, Share } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Box, Text, Button } from "@/components/primitives";
import { useTheme } from "@/theme";
import type { Achievement } from "../types";
import { getAchievementDisplayInfo, getRarityColor } from "../definitions";
import { triggerHaptic, type HapticFeedbackKind } from "@/utils/haptics";
import { createDebugger } from "@/utils/debug";

const debug = createDebugger("achievements:detail-sheet");

// ============================================================================
// Types
// ============================================================================

interface AchievementDetailSheetProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: number;
  unlockedAt?: number;
  onClose: () => void;
  onShare?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const AchievementDetailSheet: React.FC<AchievementDetailSheetProps> = ({ achievement, isUnlocked, progress = 0, unlockedAt, onClose, onShare }) => {
  const { theme } = useTheme();
  const display = getAchievementDisplayInfo(achievement, isUnlocked);
  const rarityColor = getRarityColor(achievement.rarity);

  // Animation for legendary achievements
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(achievement.rarity === "LEGENDARY" ? 1.05 : 1, { damping: 10 }) }],
  }));

  // Handle share
  const handleShare = useCallback(async () => {
    await triggerHaptic("impactMedium");

    const shareText = isUnlocked ? `I just unlocked "${display.title}" in VEX! 🏆\n\n${display.description}\n\n${achievement.shareText}` : `Check out this achievement in VEX: "${display.title}"\n\nCan you unlock it?`;

    try {
      await Share.share({
        message: shareText,
        title: "VEX Achievement",
      });
      onShare?.();
    } catch (error) {
      debug.error("Share failed", error instanceof Error ? error : new Error(String(error)));
    }
  }, [achievement, display, isUnlocked, onShare]);

  // Calculate progress percentage
  const completionPercentage = useMemo(() => {
    return Math.min(100, Math.round((progress / achievement.progressMax) * 100));
  }, [progress, achievement.progressMax]);

  // Format unlock date
  const formattedUnlockDate = useMemo(() => {
    if (!unlockedAt) {
      return null;
    }
    return new Date(unlockedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [unlockedAt]);

  // Is this a legendary hidden achievement that is still locked?
  const isHiddenLegendaryLocked = achievement.isHidden && !isUnlocked && achievement.rarity === "LEGENDARY";

  return (
    <Box flex={1} bg={theme.colors.background.primary} style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
      {/* Handle indicator */}
      <Box alignItems="center" pt={3} pb={2}>
        <Box width={40} height={4} borderRadius={2} bg={theme.colors.border.DEFAULT} />
      </Box>

      {/* Scrollable content */}
      <Box flex={1} px={6} py={4}>
        {/* Large Icon */}
        <Box alignItems="center" mb={6}>
          <Animated.View style={achievement.rarity === "LEGENDARY" ? glowStyle : undefined}>
            <Box
              width={120}
              height={120}
              borderRadius={60}
              bg={isUnlocked ? `${rarityColor}30` : theme.colors.background.tertiary}
              alignItems="center"
              justifyContent="center"
              style={{
                borderWidth: 4,
                borderColor: isUnlocked ? rarityColor : theme.colors.border.DEFAULT,
                shadowColor: isUnlocked ? rarityColor : "transparent",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isUnlocked ? 0.5 : 0,
                shadowRadius: isUnlocked ? 20 : 0,
                elevation: isUnlocked ? 10 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 60,
                  opacity: isUnlocked ? 1 : 0.4,
                }}
              >
                {display.icon}
              </Text>
            </Box>
          </Animated.View>

          {/* Rarity Badge */}
          <Box mt={4} px={4} py={1} borderRadius={8} style={{ backgroundColor: `${rarityColor}25` }}>
            <Text variant="label" color={rarityColor} fontWeight="bold">
              {achievement.rarity}
            </Text>
          </Box>
        </Box>

        {/* Title */}
        <Text variant="h2" color={isUnlocked ? theme.colors.text.primary : theme.colors.text.tertiary} textAlign="center" mb={2}>
          {display.title}
        </Text>

        {/* Description */}
        <Text variant="body" color={theme.colors.text.secondary} textAlign="center" mb={6} style={{ lineHeight: 22 }}>
          {isHiddenLegendaryLocked ? "This achievement is rumored to exist... The conditions to unlock it remain a mystery to all but the most dedicated players." : display.description}
        </Text>

        {/* Unlock Info */}
        {isUnlocked ? (
          <Box
            p={4}
            borderRadius={16}
            bg={theme.colors.background.secondary}
            mb={4}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.success.DEFAULT,
            }}
          >
            <Box flexDirection="row" alignItems="center" justifyContent="center" gap={2} mb={2}>
              <Text style={{ fontSize: 20 }}>✅</Text>
              <Text variant="h4" color={theme.colors.success.DEFAULT}>
                Unlocked!
              </Text>
            </Box>
            {formattedUnlockDate && (
              <Text variant="body" color={theme.colors.text.secondary} textAlign="center">
                Unlocked on {formattedUnlockDate}
              </Text>
            )}
          </Box>
        ) : (
          <Box p={4} borderRadius={16} bg={theme.colors.background.secondary} mb={4}>
            <Text variant="label" color={theme.colors.text.tertiary} textAlign="center" mb={2}>
              HOW TO UNLOCK
            </Text>

            {isHiddenLegendaryLocked ? (
              <Text variant="body" color={theme.colors.text.secondary} textAlign="center" style={{ fontStyle: "italic" }}>
                ???
              </Text>
            ) : (
              <>
                <Text variant="body" color={theme.colors.text.secondary} textAlign="center" mb={3}>
                  {achievement.isHidden ? "This is a hidden achievement. Keep playing to discover how to unlock it!" : `Complete ${achievement.progressMax > 1 ? `${achievement.progressMax} ` : ""}${achievement.unlockCondition.type.toLowerCase().replace(/_/g, " ")}${achievement.unlockCondition.context ? " with specific conditions" : ""}`}
                </Text>

                {/* Progress bar */}
                {progress > 0 && (
                  <Box>
                    <Box height={8} borderRadius={4} bg={theme.colors.background.tertiary} style={{ overflow: "hidden" }}>
                      <Box height="100%" borderRadius={4} bg={rarityColor} style={{ width: `${completionPercentage}%` }} />
                    </Box>
                    <Text variant="caption" color={theme.colors.text.tertiary} textAlign="center" mt={1}>
                      {progress} / {achievement.progressMax} ({completionPercentage}%)
                    </Text>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        {/* Rewards */}
        <Box mb={4}>
          <Text variant="label" color={theme.colors.text.tertiary} textAlign="center" mb={2}>
            REWARDS
          </Text>
          <Box flexDirection="row" justifyContent="center" gap={4}>
            {achievement.reward.coins && (
              <Box alignItems="center">
                <Text style={{ fontSize: 24 }}>🪙</Text>
                <Text variant="body" color={theme.colors.warning.DEFAULT}>
                  {achievement.reward.coins.toLocaleString()}
                </Text>
              </Box>
            )}
            {achievement.reward.xp && (
              <Box alignItems="center">
                <Text style={{ fontSize: 24 }}>⭐</Text>
                <Text variant="body" color={theme.colors.text.primary}>
                  {achievement.reward.xp.toLocaleString()} XP
                </Text>
              </Box>
            )}
            {achievement.reward.gems && (
              <Box alignItems="center">
                <Text style={{ fontSize: 24 }}>💎</Text>
                <Text variant="body" color={theme.colors.primary[500]}>
                  {achievement.reward.gems.toLocaleString()}
                </Text>
              </Box>
            )}
            {achievement.reward.badge && (
              <Box alignItems="center">
                <Text style={{ fontSize: 24 }}>🏅</Text>
                <Text variant="body" color={theme.colors.accent.purple}>
                  Badge
                </Text>
              </Box>
            )}
            {achievement.reward.title && (
              <Box alignItems="center">
                <Text style={{ fontSize: 24 }}>👑</Text>
                <Text variant="body" color={theme.colors.warning.DEFAULT}>
                  Title
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Point Value */}
        <Box alignItems="center" mb={6}>
          <Box flexDirection="row" alignItems="center" gap={2} px={4} py={2} borderRadius={12} style={{ backgroundColor: `${rarityColor}15` }}>
            <Text style={{ fontSize: 20 }}>🏆</Text>
            <Text variant="h3" color={rarityColor}>
              {achievement.pointValue}
            </Text>
            <Text variant="caption" color={theme.colors.text.tertiary}>
              points
            </Text>
          </Box>
        </Box>

        {/* Share Button */}
        <Button variant="outline" size="lg" fullWidth onPress={handleShare} accessibilityLabel="📤 Share Achievement button" accessibilityRole="button" accessibilityHint="Activates this control">
          📤 Share Achievement
        </Button>

        {/* Close Button */}
        <Button variant="ghost" size="md" fullWidth onPress={onClose} accessibilityLabel="Close button" accessibilityRole="button" accessibilityHint="Activates this control">
          Close
        </Button>
      </Box>
    </Box>
  );
};

// ============================================================================
// Export
// ============================================================================

export default AchievementDetailSheet;
