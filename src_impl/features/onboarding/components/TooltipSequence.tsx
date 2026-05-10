/**
 * TooltipSequence Component
 *
 * Post-onboarding home tooltip sequence.
 * 3 sequential tooltips pointing to key UI elements.
 * Dismissed by tap, never shown again.
 *
 * @phase 2.8
 */

import React, { useState, useCallback } from "react";
import { Pressable, Dimensions } from "react-native";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withSpring, withSequence, withTiming } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TooltipSequenceProps {
  hasStreak: boolean;
  hasBoss: boolean;
  onComplete: () => void;
}

interface Tooltip {
  id: number;
  title: string;
  message: string;
  target: "streak" | "boss" | "challenges";
  position: { x: number; y: number };
  arrowDirection: "up" | "down" | "left" | "right";
}

/**
 * Individual tooltip bubble
 */
function TooltipBubble({ tooltip, isActive, onDismiss }: { tooltip: Tooltip; isActive: boolean; onDismiss: () => void }): JSX.Element | null {
  const { theme } = useTheme();

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSequence(withTiming(0.8, { duration: 100 }), withSpring(1, { damping: 12, stiffness: 200 })),
      },
    ],
  }));

  if (!isActive) {
    return <></>;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[
        {
          position: "absolute",
          left: Math.min(tooltip.position.x, SCREEN_WIDTH - 280),
          top: tooltip.position.y,
          width: 260,
          zIndex: 1001,
        },
        bounceStyle,
      ]}
    >
      <Pressable onPress={onDismiss} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box p="lg" borderRadius="xl" bg="background.elevated" borderWidth={2} borderColor="primary.500" style={{ shadowColor: theme.colors.background.elevated, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}>
          {/* Counter */}
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="sm">
            <Text variant="caption" color="primary.500" fontWeight="700">
              Tip {tooltip.id} of 3
            </Text>
            <Text variant="caption" color="text.tertiary">
              Tap to continue ›
            </Text>
          </Box>

          {/* Title */}
          <Text variant="h4" color="text.primary" mb="xs">
            {tooltip.title}
          </Text>

          {/* Message */}
          <Text variant="body" color="text.secondary">
            {tooltip.message}
          </Text>
        </Box>

        {/* Arrow pointing to target */}
        <Box
          style={{
            position: "absolute",
            [tooltip.arrowDirection === "up" ? "bottom" : "top"]: -10,
            left: "50%",
            marginLeft: -10,
            width: 0,
            height: 0,
            backgroundColor: "transparent",
            borderStyle: "solid",
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderTopWidth: tooltip.arrowDirection === "up" ? 0 : 10,
            borderBottomWidth: tooltip.arrowDirection === "up" ? 10 : 0,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: tooltip.arrowDirection === "up" ? theme.colors.primary[500] : "transparent",
            borderBottomColor: tooltip.arrowDirection === "up" ? "transparent" : theme.colors.primary[500],
          }}
        />
      </Pressable>
    </Animated.View>
  );
}

/**
 * Dark overlay behind tooltips
 */
function TooltipOverlay({ isVisible, onPress }: { isVisible: boolean; onPress: () => void }): JSX.Element {
  const { theme } = useTheme();

  if (!isVisible) {
    return <></>;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `${theme.colors.background.primary}80`,
        zIndex: 1000,
      }}
    >
      <Pressable onPress={onPress} style={{ flex: 1 }} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control" />
    </Animated.View>
  );
}

/**
 * Tooltip sequence manager
 */
export function TooltipSequence({ hasStreak: _hasStreak, hasBoss, onComplete }: TooltipSequenceProps): JSX.Element {
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);

  // Build tooltip list based on user state
  const tooltips: Tooltip[] = [
    {
      id: 1,
      title: "Build Your Streak",
      message: "Complete one session per day to build your streak. The longer your streak, the bigger your XP multiplier!",
      target: "streak",
      position: { x: SCREEN_WIDTH / 2 - 130, y: 180 },
      arrowDirection: "up",
    },
    ...(hasBoss
      ? [
          {
            id: 2,
            title: "Defeat Bosses",
            message: "Bosses give bonus XP. Each session deals damage. Defeat them before they escape!",
            target: "boss" as const,
            position: { x: SCREEN_WIDTH / 2 - 130, y: 320 },
            arrowDirection: "down" as const,
          },
        ]
      : []),
    {
      id: hasBoss ? 3 : 2,
      title: "Complete Challenges",
      message: "Daily and weekly challenges give bonus rewards. Check back often for new quests!",
      target: "challenges" as const,
      position: { x: SCREEN_WIDTH / 2 - 130, y: 450 },
      arrowDirection: "down" as const,
    },
  ];

  const handleDismiss = useCallback(() => {
    if (currentTooltipIndex < tooltips.length - 1) {
      setCurrentTooltipIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [currentTooltipIndex, tooltips.length, onComplete]);

  // Don't render if no tooltips
  if (tooltips.length === 0) {
    return <></>;
  }

  const currentTooltip = tooltips[currentTooltipIndex];

  return (
    <>
      <TooltipOverlay isVisible={true} onPress={handleDismiss} />
      <TooltipBubble tooltip={currentTooltip} isActive={true} onDismiss={handleDismiss} />
    </>
  );
}

export default TooltipSequence;
