import React, { useEffect, useCallback } from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { Box, Text } from "@/components/primitives";
import { useTheme } from "@/theme";
import { achievementUnlocked } from "@/utils/haptics";
import type { AchievementRarity } from "../types";
import type { Achievement } from "../types";
import { getAchievementDisplayInfo, getRarityColor } from "../definitions";

const DISMISS_DURATIONS: Record<AchievementRarity, number> = {
  COMMON: 3500,
  UNCOMMON: 3500,
  RARE: 3500,
  EPIC: 5000,
  LEGENDARY: 5000,
};

interface AchievementUnlockToastProps {
  achievement: Achievement;
  onPress: () => void;
  onDismiss: () => void;
  visible: boolean;
}
export const AchievementUnlockToast: React.FC<AchievementUnlockToastProps> = ({
  achievement,
  onPress,
  onDismiss,
  visible,
}) => {
  const { theme } = useTheme();
  const display = getAchievementDisplayInfo(achievement, true);
  const rarityColor = getRarityColor(achievement.rarity);
  const isHighRarity =
    achievement.rarity === "EPIC" || achievement.rarity === "LEGENDARY";
  const translateY = useSharedValue(-200);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);
  const handleDismiss = useCallback(() => {
    translateY.value = withTiming(-200, { duration: 300 }, () => {
      "worklet";
      runOnJS(onDismiss)();
    });
    opacity.value = withTiming(0, { duration: 200 });
    return;
  }, [onDismiss, opacity, translateY]);
  useEffect(() => {
    if (visible) {
      void achievementUnlocked();
      translateY.value = withSpring(60, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12, stiffness: 150 });
      if (isHighRarity) {
        glowOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
      }
      const dismissDuration = DISMISS_DURATIONS[achievement.rarity];
      const timeout = setTimeout(() => {
        handleDismiss();
      }, dismissDuration);
      return () => clearTimeout(timeout);
    } else {
      translateY.value = withTiming(-200, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
      return;
    }
  }, [
    achievement.rarity,
    glowOpacity,
    handleDismiss,
    isHighRarity,
    opacity,
    scale,
    translateY,
    visible,
  ]);
  const handlePress = useCallback(() => {
    handleDismiss();
    setTimeout(() => {
      onPress();
    }, 200);
    return;
  }, [handleDismiss, onPress]);
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  if (!visible) return null;
  return (
    <Animated.View
      style={[
        { position: "absolute", top: 0, left: 16, right: 16, zIndex: 1000 },
        containerStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        {isHighRarity && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: -10,
                left: -10,
                right: -10,
                bottom: -10,
                backgroundColor: rarityColor,
                borderRadius: 24,
              },
              glowStyle,
            ]}
            pointerEvents="none"
          />
        )}

        <Box
          p={isHighRarity ? 5 : 4}
          borderRadius={16}
          bg={theme.colors.background.secondary}
          style={{
            borderWidth: 2,
            borderColor: rarityColor,
            shadowColor: rarityColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Box flexDirection="row" alignItems="center" gap={3}>
            <Box
              width={isHighRarity ? 56 : 48}
              height={isHighRarity ? 56 : 48}
              borderRadius={isHighRarity ? 28 : 24}
              bg={`${rarityColor}25`}
              alignItems="center"
              justifyContent="center"
              style={{ borderWidth: 2, borderColor: rarityColor }}
            >
              <Text style={{ fontSize: isHighRarity ? 32 : 28 }}>
                {display.icon}
              </Text>
            </Box>

            <Box flex={1}>
              <Text
                variant="caption"
                color={rarityColor}
                fontWeight="bold"
                mb={1}
              >
                🏆 ACHIEVEMENT UNLOCKED
              </Text>
              <Text
                variant={isHighRarity ? "h4" : "body"}
                color={theme.colors.text.primary}
                fontWeight="semibold"
                numberOfLines={1}
              >
                {display.title}
              </Text>
            </Box>

            <Box
              px={3}
              py={1}
              borderRadius={8}
              style={{ backgroundColor: `${rarityColor}30` }}
            >
              <Text variant="caption" color={rarityColor} fontWeight="bold">
                {achievement.rarity}
              </Text>
            </Box>
          </Box>

          {achievement.rarity === "LEGENDARY" && (
            <Box mt={3} alignItems="center">
              <Text variant="caption" color={theme.colors.warning.DEFAULT}>
                ✨ LEGENDARY RARITY ✨
              </Text>
            </Box>
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
};
