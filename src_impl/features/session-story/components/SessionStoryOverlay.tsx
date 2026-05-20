import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { useSessionStory } from "../hooks";
import { StoryBeatCard } from "./StoryBeatCard";
import { StoryOverlayHeader } from "./StoryOverlayHeader";
import type { StoryBeat, EmotionalArc } from "../schemas";
import { launchColors } from '@theme/tokens/launch-colors';

interface SessionStoryOverlayProps {
  sessionId: string;
  userId: string;
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}
export const SessionStoryOverlay: React.FC<SessionStoryOverlayProps> = ({
  sessionId,
  userId,
  isVisible,
  onComplete,
  onSkip,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { isReducedMotion } = useReducedMotion();
  const { story, isLoading } = useSessionStory(sessionId, userId);
  const fadeAnim = useSharedValue(0);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  useEffect(() => {
    if (isVisible && story && !hasStarted) {
      setHasStarted(true);
      fadeAnim.value = withTiming(1, { duration: isReducedMotion ? 100 : 400 });
    }
  }, [isVisible, story, hasStarted, fadeAnim, isReducedMotion]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: fadeAnim.value }));
  const handleHaptic = useCallback(
    (pattern: StoryBeat["hapticPattern"]) => {
      if (isReducedMotion) {
        return;
      }
      switch (pattern) {
        case "LIGHT":
          haptics.impact("light");
          break;
        case "MEDIUM":
          haptics.impact("medium");
          break;
        case "HEAVY":
          haptics.impact("heavy");
          break;
        case "SUCCESS":
          haptics.success("light");
          break;
        case "CELEBRATION":
          haptics.success("heavy");
          break;
      }
    },
    [isReducedMotion],
  );
  useEffect(() => {
    if (!story || !hasStarted) {
      return;
    }
    if (currentBeatIndex >= story.totalBeats) {
      setTimeout(() => {
        onComplete();
      }, 500);
      return;
    }
    const currentBeat = story.beats[currentBeatIndex]!;
    if (currentBeat.hapticPattern !== "NONE" && !isReducedMotion) {
      handleHaptic(currentBeat.hapticPattern);
    }
    const timer = setTimeout(() => {
      setCurrentBeatIndex((prev) => prev + 1);
    }, currentBeat.durationMs);
    return () => clearTimeout(timer);
  }, [
    currentBeatIndex,
    story,
    hasStarted,
    onComplete,
    isReducedMotion,
    handleHaptic,
  ]);
  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);
  const handleNext = useCallback(() => {
    if (story && currentBeatIndex < story.totalBeats - 1) {
      setCurrentBeatIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [currentBeatIndex, story, onComplete]);
  const currentBeat = story?.beats[currentBeatIndex];
  const getEmotionColor = (emotion: EmotionalArc): string => {
    const colors: Record<EmotionalArc, string> = {
      TRIUMPH: theme.colors.success.DEFAULT,
      MASTERY: theme.colors.primary[500],
      RESILIENCE: theme.colors.warning.DEFAULT,
      DETERMINATION: theme.colors.info.DEFAULT,
      ANTICIPATION: theme.colors.primary[400] ?? theme.colors.primary[500],
      WONDER: theme.colors.primary[400] ?? theme.colors.primary[500],
      GRATITUDE: theme.colors.success.DEFAULT,
      RELIEF: theme.colors.success.DEFAULT,
    };
    return colors[emotion] ?? theme.colors.primary[500];
  };
  const emotionColor = currentBeat
    ? getEmotionColor(currentBeat.emotion)
    : theme.colors.primary[500];
  if (isLoading || !story) {
    return <View />;
  }
  if (!isVisible) {
    return <View />;
  }
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          backgroundColor: theme.colors.background?.primary ?? launchColors.hex_000,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        animatedStyle,
      ]}
    >
      <StoryOverlayHeader
        beats={story.beats}
        currentBeatIndex={currentBeatIndex}
        emotionColor={emotionColor}
        onSkip={handleSkip}
        borderColor={theme.colors.border?.DEFAULT ?? launchColors.hex_3333}
        mutedColor={theme.colors.text?.muted ?? launchColors.hex_888}
      />
      {}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        {currentBeat && (
          <StoryBeatCard
            beat={currentBeat}
            emotionColor={emotionColor}
            theme={theme}
          />
        )}
      </View>

      {}
      <Pressable
        style={{ paddingVertical: 24, alignItems: "center" }}
        onPress={handleNext}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: theme.colors.text?.muted ?? launchColors.hex_888,
          }}
        >
          Tap to continue
        </Text>
      </Pressable>
    </Animated.View>
  );
};
export default SessionStoryOverlay;
