import React, { useCallback, useMemo } from "react";
import { Share } from "react-native";
import { Box, Text, Button } from "@/components/primitives";
import { useTheme } from "@/theme";
import type { Achievement } from "../types";
import { getAchievementDisplayInfo } from "../definitions";
import { triggerHaptic } from "@/utils/haptics";
import { createDebugger } from "@/utils/debug";
import { AchievementDetailIcon } from "./AchievementDetailIcon";
import { AchievementUnlockStatus } from "./AchievementUnlockStatus";
import { AchievementRewards } from "./AchievementRewards";

const debug = createDebugger("achievements:detail-sheet");

interface AchievementDetailSheetProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: number;
  unlockedAt?: number;
  onClose: () => void;
  onShare?: () => void;
}

export const AchievementDetailSheet: React.FC<AchievementDetailSheetProps> = ({
  achievement,
  isUnlocked,
  progress = 0,
  unlockedAt,
  onClose,
  onShare,
}) => {
  const { theme } = useTheme();
  const display = getAchievementDisplayInfo(achievement, isUnlocked);

  const handleShare = useCallback(async () => {
    await triggerHaptic("impactMedium");
    const shareText = isUnlocked
      ? `I just unlocked "${display.title}" in VEX! 🏆\n\n${display.description}\n\n${achievement.shareText}`
      : `Check out this achievement in VEX: "${display.title}"\n\nCan you unlock it?`;
    try {
      await Share.share({ message: shareText, title: "VEX Achievement" });
      onShare?.();
    } catch (error) {
      debug.error(
        "Share failed",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }, [achievement, display, isUnlocked, onShare]);

  const isHiddenLegendaryLocked = useMemo(
    () =>
      achievement.isHidden && !isUnlocked && achievement.rarity === "LEGENDARY",
    [achievement.isHidden, achievement.rarity, isUnlocked],
  );

  return (
    <Box
      flex={1}
      bg={theme.colors.background.primary}
      style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
    >
      <Box alignItems="center" pt={3} pb={2}>
        <Box
          width={40}
          height={4}
          borderRadius={2}
          bg={theme.colors.border.DEFAULT}
        />
      </Box>

      <Box flex={1} px={6} py={4}>
        <AchievementDetailIcon
          achievement={achievement}
          isUnlocked={isUnlocked}
        />

        <Text
          variant="h2"
          color={
            isUnlocked ? theme.colors.text.primary : theme.colors.text.tertiary
          }
          textAlign="center"
          mb={2}
        >
          {display.title}
        </Text>

        <Text
          variant="body"
          color={theme.colors.text.secondary}
          textAlign="center"
          mb={6}
          style={{ lineHeight: 22 }}
        >
          {isHiddenLegendaryLocked
            ? "This achievement is rumored to exist... The conditions to unlock it remain a mystery to all but the most dedicated players."
            : display.description}
        </Text>

        <AchievementUnlockStatus
          achievement={achievement}
          isUnlocked={isUnlocked}
          progress={progress}
          unlockedAt={unlockedAt}
        />

        <AchievementRewards achievement={achievement} />

        <Button
          variant="outline"
          size="lg"
          fullWidth
          onPress={handleShare}
          accessibilityLabel="📤 Share Achievement button"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          📤 Share Achievement
        </Button>

        <Button
          variant="ghost"
          size="md"
          fullWidth
          onPress={onClose}
          accessibilityLabel="Close button"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default AchievementDetailSheet;
