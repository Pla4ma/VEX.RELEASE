import React from "react";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Box, Text } from "@/components/primitives";
import { useTheme } from "@/theme";
import type { Achievement } from "../types";
import { getAchievementDisplayInfo, getRarityColor } from "../definitions";

interface AchievementDetailIconProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

export const AchievementDetailIcon: React.FC<AchievementDetailIconProps> = ({
  achievement,
  isUnlocked,
}) => {
  const { theme } = useTheme();
  const display = getAchievementDisplayInfo(achievement, isUnlocked);
  const rarityColor = getRarityColor(achievement.rarity);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(achievement.rarity === "LEGENDARY" ? 1.05 : 1, {
          damping: 10,
        }),
      },
    ],
  }));

  return (
    <Box alignItems="center" mb={6}>
      <Animated.View
        style={achievement.rarity === "LEGENDARY" ? glowStyle : undefined}
      >
        <Box
          width={120}
          height={120}
          borderRadius={60}
          bg={
            isUnlocked
              ? `${rarityColor}30`
              : theme.colors.background.tertiary
          }
          alignItems="center"
          justifyContent="center"
          style={{
            borderWidth: 4,
            borderColor: isUnlocked
              ? rarityColor
              : theme.colors.border.DEFAULT,
            shadowColor: isUnlocked ? rarityColor : "transparent",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isUnlocked ? 0.5 : 0,
            shadowRadius: isUnlocked ? 20 : 0,
            elevation: isUnlocked ? 10 : 0,
          }}
        >
          <Text style={{ fontSize: 60, opacity: isUnlocked ? 1 : 0.4 }}>
            {display.icon}
          </Text>
        </Box>
      </Animated.View>

      <Box
        mt={4}
        px={4}
        py={1}
        borderRadius={8}
        style={{ backgroundColor: `${rarityColor}25` }}
      >
        <Text variant="label" color={rarityColor} fontWeight="bold">
          {achievement.rarity}
        </Text>
      </Box>
    </Box>
  );
};
