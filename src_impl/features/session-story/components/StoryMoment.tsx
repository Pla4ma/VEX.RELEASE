import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import { haptics } from "@/shared/feedback";
import { useReducedMotion } from "@/hooks";
import { StoryBeatContent } from "./StoryBeatContent";
import type { SessionStory } from "../schemas";
import { launchColors } from '@theme/tokens/launch-colors';

interface StoryMomentProps {
  story: SessionStory;
  onComplete: () => void;
  onSkip?: () => void;
}
export const StoryMoment: React.FC<StoryMomentProps> = ({
  story,
  onComplete,
  onSkip,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { isReducedMotion } = useReducedMotion();
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const fadeAnim = useSharedValue(0);
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: isReducedMotion ? 100 : 400 });
  }, [fadeAnim, isReducedMotion]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: fadeAnim.value }));
  const currentBeat = story.beats[currentBeatIndex];
  const isLastBeat = currentBeatIndex >= story.totalBeats - 1;
  const handleTap = useCallback(() => {
    if (isLastBeat) {
      onComplete();
    } else {
      if (!isReducedMotion) {
        haptics.impact("light");
      }
      setCurrentBeatIndex((prev) => prev + 1);
    }
  }, [isLastBeat, onComplete, isReducedMotion]);
  const handleSkip = useCallback(() => {
    onSkip?.();
    onComplete();
  }, [onSkip, onComplete]);
  if (!currentBeat) {
    return null;
  }
  return (
    <Animated.View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background?.primary ?? launchColors.hex_000,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        animatedStyle,
      ]}
    >
      {}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", gap: 6 }}>
          {story.beats.map((_, index) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  index <= currentBeatIndex
                    ? (theme.colors.primary?.[500] ?? launchColors.hex_fff)
                    : (theme.colors.border?.DEFAULT ?? launchColors.hex_333),
              }}
            />
          ))}
        </View>

        {onSkip && (
          <Pressable onPress={handleSkip}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: theme.colors.text?.muted ?? launchColors.hex_888,
              }}
            >
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      {}
      <Pressable
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
        onPress={handleTap}
      >
        <StoryBeatContent beat={currentBeat} theme={theme} />
      </Pressable>

      {}
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: theme.colors.text?.muted ?? launchColors.hex_888,
          }}
        >
          {isLastBeat ? "Tap to finish" : "Tap to continue"}
        </Text>
      </View>
    </Animated.View>
  );
};
export default StoryMoment;
