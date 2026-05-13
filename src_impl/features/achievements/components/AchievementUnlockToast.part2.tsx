import React, { useEffect, useCallback } from "react";
import { Pressable, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, runOnJS } from "react-native-reanimated";
import { Box, Text } from "@/components/primitives";
import { useTheme } from "@/theme";
import { achievementUnlocked } from "@/utils/haptics";
import type { Achievement, AchievementRarity } from "../types";
import { getAchievementDisplayInfo, getRarityColor } from "../definitions";


export function useAchievementUnlockToast(
  userId: string,
  _onAchievementPress: (achievementId: string) => void,
): {
  currentToast: Achievement | null;
  dismissToast: () => void;
} {
  const [currentToast, setCurrentToast] = React.useState<Achievement | null>(
    null,
  );
  const toastQueue = React.useRef<Achievement[]>([]);

  // Listen for achievement unlock events
  const showNextToast = React.useCallback(() => {
    const nextAchievement = toastQueue.current.shift();
    if (nextAchievement) {
      setCurrentToast(nextAchievement);
    }
  }, []);

  React.useEffect(() => {
    // Subscribe to achievement:unlocked event
    const handleUnlock = (event: {
      userId: string;
      achievementId: string;
      unlockedAt: number;
    }) => {
      if (event.userId !== userId) {
        return;
      }

      // Get achievement details
      const { getAchievementById } = require("../definitions");
      const achievement = getAchievementById(event.achievementId);
      if (!achievement) {
        return;
      }

      // Add to queue
      toastQueue.current.push(achievement);

      // Show toast if none currently visible
      if (!currentToast) {
        showNextToast();
      }
    };

    // In a real app, subscribe to event bus
    // const unsubscribe = eventBus.subscribe('achievement:unlocked', handleUnlock);

    return () => {
      // unsubscribe();
    };
  }, [userId, currentToast, showNextToast]);

  const dismissToast = React.useCallback(() => {
    setCurrentToast(null);
    // Show next toast after a short delay
    setTimeout(() => {
      showNextToast();
    }, 300);
  }, [showNextToast]);

  return {
    currentToast,
    dismissToast,
  };
}

export const AchievementToastProvider: React.FC<
  AchievementToastProviderProps
> = ({ children, userId, onAchievementPress }) => {
  const { currentToast, dismissToast } = useAchievementUnlockToast(
    userId,
    onAchievementPress,
  );

  return (
    <Box flex={1}>
      {children}
      {currentToast && (
        <AchievementUnlockToast
          achievement={currentToast}
          onPress={() => onAchievementPress(currentToast.id)}
          onDismiss={dismissToast}
          visible={!!currentToast}
        />
      )}
    </Box>
  );
};