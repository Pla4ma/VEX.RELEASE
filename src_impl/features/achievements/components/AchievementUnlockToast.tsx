/**
 * AchievementUnlockToast
 *
 * Toast notification for achievement unlocks.
 * Slides down from top, shows icon + title + rarity.
 * Auto-dismisses with duration based on rarity.
 * Tap to navigate to achievement detail.
 * Haptic feedback on display.
 */

<<<<<<< HEAD
import React, { useEffect, useCallback } from "react";
import { Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, runOnJS } from "react-native-reanimated";
import { Box, Text } from "@/components/primitives";
import { useTheme } from "@/theme";
import { achievementUnlocked } from "@/utils/haptics";
import type { Achievement, AchievementRarity } from "../types";
import { getAchievementDisplayInfo, getRarityColor } from "../definitions";
=======
import React, { useEffect, useCallback } from 'react';
import { Pressable, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, runOnJS } from 'react-native-reanimated';
import { Box, Text } from '@/components/primitives';
import { useTheme } from '@/theme';
import { achievementUnlocked } from '@/utils/haptics';
import type { Achievement, AchievementRarity } from '../types';
import { getAchievementDisplayInfo, getRarityColor } from '../definitions';
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

// ============================================================================
// Constants
// ============================================================================

<<<<<<< HEAD
=======
const { width: SCREEN_WIDTH } = Dimensions.get('window');

>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
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

export const AchievementUnlockToast: React.FC<AchievementUnlockToastProps> = ({ achievement, onPress, onDismiss, visible }) => {
  const { theme } = useTheme();
  const display = getAchievementDisplayInfo(achievement, true);
  const rarityColor = getRarityColor(achievement.rarity);

  const isHighRarity = achievement.rarity === 'EPIC' || achievement.rarity === 'LEGENDARY';

  // Animation values
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
    return; // Explicit return to satisfy all code paths
  }, [onDismiss, opacity, translateY]);

  // Trigger haptic and entrance animation
  useEffect(() => {
    if (visible) {
      // Haptic feedback for achievement unlock
      void achievementUnlocked();

      // Entrance animation
      translateY.value = withSpring(60, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12, stiffness: 150 });

      // Glow animation for high rarity
      if (isHighRarity) {
        glowOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
      }

      // Auto-dismiss
      const dismissDuration = DISMISS_DURATIONS[achievement.rarity];
      const timeout = setTimeout(() => {
        handleDismiss();
      }, dismissDuration);

      return () => clearTimeout(timeout);
    } else {
      // Exit animation
      translateY.value = withTiming(-200, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
      return; // Explicit return for else branch
    }
<<<<<<< HEAD
  }, [achievement.rarity, glowOpacity, handleDismiss, isHighRarity, opacity, scale, translateY, visible]);
=======
  }, [visible, achievement.rarity]);

  const handleDismiss = useCallback(() => {
    translateY.value = withTiming(-200, { duration: 300 }, () => {
      'worklet';
      runOnJS(onDismiss)();
    });
    opacity.value = withTiming(0, { duration: 200 });
    return; // Explicit return to satisfy all code paths
  }, [onDismiss]);
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

  const handlePress = useCallback(() => {
    handleDismiss();
    // Small delay to let animation start before navigating
    setTimeout(() => {
      onPress();
    }, 200);
    return; // Explicit return to satisfy all code paths
  }, [handleDismiss, onPress]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 16,
          right: 16,
          zIndex: 1000,
        },
        containerStyle,
      ]}
    >
      <Pressable onPress={handlePress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        {/* Glow effect for EPIC/LEGENDARY */}
        {isHighRarity && (
          <Animated.View
            style={[
              {
                position: 'absolute',
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
            {/* Icon */}
            <Box
              width={isHighRarity ? 56 : 48}
              height={isHighRarity ? 56 : 48}
              borderRadius={isHighRarity ? 28 : 24}
              bg={`${rarityColor}25`}
              alignItems="center"
              justifyContent="center"
              style={{
                borderWidth: 2,
                borderColor: rarityColor,
              }}
            >
              <Text style={{ fontSize: isHighRarity ? 32 : 28 }}>{display.icon}</Text>
            </Box>

            {/* Content */}
            <Box flex={1}>
              <Text variant="caption" color={rarityColor} fontWeight="bold" mb={1}>
                🏆 ACHIEVEMENT UNLOCKED
              </Text>
              <Text variant={isHighRarity ? 'h4' : 'body'} color={theme.colors.text.primary} fontWeight="semibold" numberOfLines={1}>
                {display.title}
              </Text>
            </Box>

            {/* Rarity Badge */}
            <Box px={3} py={1} borderRadius={8} style={{ backgroundColor: `${rarityColor}30` }}>
              <Text variant="caption" color={rarityColor} fontWeight="bold">
                {achievement.rarity}
              </Text>
            </Box>
          </Box>

          {/* Extra flair for LEGENDARY */}
          {achievement.rarity === 'LEGENDARY' && (
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

// ============================================================================
// Toast Manager Hook
// ============================================================================

/**
 * Hook to manage achievement unlock toasts
 * Listens to achievement:unlocked events and shows toasts
 */
export function useAchievementUnlockToast(
  userId: string,
  _onAchievementPress: (achievementId: string) => void,
): {
  currentToast: Achievement | null;
  dismissToast: () => void;
} {
  const [currentToast, setCurrentToast] = React.useState<Achievement | null>(null);
  const toastQueue = React.useRef<Achievement[]>([]);

<<<<<<< HEAD
=======
  // Listen for achievement unlock events
  React.useEffect(() => {
    // Subscribe to achievement:unlocked event
    const handleUnlock = (event: { userId: string; achievementId: string; unlockedAt: number }) => {
      if (event.userId !== userId) {
        return;
      }

      // Get achievement details
      const { getAchievementById } = require('../definitions');
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
  }, [userId, currentToast]);

>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
  const showNextToast = React.useCallback(() => {
    const nextAchievement = toastQueue.current.shift();
    if (nextAchievement) {
      setCurrentToast(nextAchievement);
    }
  }, []);

  // Listen for achievement unlock events
  React.useEffect(() => {
    // Subscribe to achievement:unlocked event
    // In a real app, subscribe to event bus
    // const unsubscribe = eventBus.subscribe('achievement:unlocked', handleUnlock);

    return () => {
      // unsubscribe();
    };
  }, [currentToast, showNextToast, userId]);

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

// ============================================================================
// Provider Component
// ============================================================================

interface AchievementToastProviderProps {
  children: React.ReactNode;
  userId: string;
  onAchievementPress: (achievementId: string) => void;
}

export const AchievementToastProvider: React.FC<AchievementToastProviderProps> = ({ children, userId, onAchievementPress }) => {
  const { currentToast, dismissToast } = useAchievementUnlockToast(userId, onAchievementPress);

  return (
    <Box flex={1}>
      {children}
      {currentToast && <AchievementUnlockToast achievement={currentToast} onPress={() => onAchievementPress(currentToast.id)} onDismiss={dismissToast} visible={!!currentToast} />}
    </Box>
  );
};

// ============================================================================
// Export
// ============================================================================

export default AchievementUnlockToast;
