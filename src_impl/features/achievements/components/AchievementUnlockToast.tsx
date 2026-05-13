/**
 * AchievementUnlockToast
 *
 * Toast notification for achievement unlocks.
 * Slides down from top, shows icon + title + rarity.
 * Auto-dismisses with duration based on rarity.
 * Tap to navigate to achievement detail.
 * Haptic feedback on display.
 */

import React, { useEffect, useCallback } from "react";
import { Pressable, Dimensions } from "react-native";
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
import type { Achievement, AchievementRarity } from "../types";
import { getAchievementDisplayInfo, getRarityColor } from "../definitions";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DISMISS_DURATIONS: Record<AchievementRarity, number> = {
  COMMON: 3500,
  UNCOMMON: 3500,
  RARE: 3500,
  EPIC: 5000,
  LEGENDARY: 5000,
};

// ============================================================================
// Types
// ============================================================================

interface AchievementUnlockToastProps {
  achievement: Achievement;
  onPress: () => void;
  onDismiss: () => void;
  visible: boolean;
}

// ============================================================================
// Component
// ============================================================================
// ============================================================================
// Toast Manager Hook
// ============================================================================
// ============================================================================
// Provider Component
// ============================================================================

interface AchievementToastProviderProps {
  children: React.ReactNode;
  userId: string;
  onAchievementPress: (achievementId: string) => void;
}

// ============================================================================
// Export
// ============================================================================

export default AchievementUnlockToast;

export * from "./AchievementUnlockToast.types";
export * from "./AchievementUnlockToast.types";
export * from "./AchievementUnlockToast.part1";
export * from "./AchievementUnlockToast.part2";
