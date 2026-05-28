import React, { useMemo } from "react";
import { Box, Text } from "@/components/primitives";
import { useTheme } from "@/theme";
import type { Achievement } from "../types";
import { getRarityColor } from "../definitions";

interface AchievementUnlockStatusProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
  unlockedAt?: number;
}

export const AchievementUnlockStatus: React.FC<
  AchievementUnlockStatusProps
> = ({ achievement, isUnlocked, progress, unlockedAt }) => {
  const { theme } = useTheme();
  const rarityColor = getRarityColor(achievement.rarity);

  const completionPercentage = useMemo(() => {
    return Math.min(
      100,
      Math.round((progress / achievement.progressMax) * 100),
    );
  }, [progress, achievement.progressMax]);

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

  const isHiddenLegendaryLocked =
    achievement.isHidden && !isUnlocked && achievement.rarity === "LEGENDARY";

  if (isUnlocked) {
    return (
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
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap={2}
          mb={2}
        >
          <Text style={{ fontSize: 20 }}>✅</Text>
          <Text variant="h4" color={theme.colors.success.DEFAULT}>
            Unlocked!
          </Text>
        </Box>
        {formattedUnlockDate && (
          <Text
            variant="body"
            color={theme.colors.text.secondary}
            textAlign="center"
          >
            Unlocked on {formattedUnlockDate}
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box
      p={4}
      borderRadius={16}
      bg={theme.colors.background.secondary}
      mb={4}
    >
      <Text
        variant="label"
        color={theme.colors.text.tertiary}
        textAlign="center"
        mb={2}
      >
        HOW TO UNLOCK
      </Text>

      {isHiddenLegendaryLocked ? (
        <Text
          variant="body"
          color={theme.colors.text.secondary}
          textAlign="center"
          style={{ fontStyle: "italic" }}
        >
          ???
        </Text>
      ) : (
        <>
          <Text
            variant="body"
            color={theme.colors.text.secondary}
            textAlign="center"
            mb={3}
          >
            {achievement.isHidden
              ? "This is a hidden achievement. Keep playing to discover how to unlock it!"
              : `Complete ${achievement.progressMax > 1 ? `${achievement.progressMax} ` : ""}${achievement.unlockCondition.type.toLowerCase().replace(/_/g, " ")}${achievement.unlockCondition.context ? " with specific conditions" : ""}`}
          </Text>

          {progress > 0 && (
            <Box>
              <Box
                height={8}
                borderRadius={4}
                bg={theme.colors.background.tertiary}
                style={{ overflow: "hidden" }}
              >
                <Box
                  height="100%"
                  borderRadius={4}
                  bg={rarityColor}
                  style={{ width: `${completionPercentage}%` }}
                />
              </Box>
              <Text
                variant="caption"
                color={theme.colors.text.tertiary}
                textAlign="center"
                mt={1}
              >
                {progress} / {achievement.progressMax} (
                {completionPercentage}%)
              </Text>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
