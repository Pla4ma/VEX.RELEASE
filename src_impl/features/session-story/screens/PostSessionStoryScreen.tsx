/**
 * Post-Session Story Screen
 * Cinematic presentation of the session completion narrative.
 */

import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated";
import { useTheme } from "@/theme";
import { haptics } from "@/shared/feedback";
import { useReducedMotion } from "@/hooks";
import type { SessionStory, StoryBeat, EmotionalArc } from "../schemas";

// ============================================================================
// Types
// ============================================================================

interface PostSessionStoryScreenProps {
  story: SessionStory;
  onComplete: () => void;
  onSkip: () => void;
  onShare?: (story: SessionStory) => void;
  autoAdvance?: boolean;
}

type StoryPhase = "intro" | "beats" | "outro" | "complete";

export const PostSessionStoryScreen: React.FC<PostSessionStoryScreenProps> = ({ story, onComplete, onSkip, onShare, autoAdvance = true }) => {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();

  const [phase, setPhase] = useState<StoryPhase>("intro");
  const [currentBeatIndex, setCurrentBeatIndex] = useState(-1);
  const [, setViewedBeats] = useState<Set<number>>(new Set());

  const scaleValue = useSharedValue(0.8);
  const fadeAnim = useSharedValue(1);
  const scaleAnim = useSharedValue(1);

  // Start intro animation
  useEffect(() => {
    scaleValue.value = withSpring(1, { damping: 12, stiffness: 100 });
    const timer = setTimeout(
      () => {
        setPhase("beats");
        setCurrentBeatIndex(0);
      },
      isReducedMotion ? 100 : 600,
    );
    return () => clearTimeout(timer);
  }, [isReducedMotion, scaleValue]);

  const triggerHaptic = useCallback(
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
          haptics.celebration();
          break;
      }
    },
    [isReducedMotion],
  );

  useEffect(() => {
    if (phase !== "beats" || currentBeatIndex < 0) {
      return;
    }
    if (currentBeatIndex >= story.totalBeats) {
      setPhase("outro");
      return;
    }
    const beat = story.beats[currentBeatIndex];
    if (beat.hapticPattern !== "NONE") {
      triggerHaptic(beat.hapticPattern);
    }
    setViewedBeats((prev) => new Set([...prev, currentBeatIndex]));
    if (!autoAdvance) {
      return;
    }
    const timer = setTimeout(() => setCurrentBeatIndex((prev) => prev + 1), beat.durationMs);
    return () => clearTimeout(timer);
  }, [currentBeatIndex, phase, autoAdvance, story, triggerHaptic]);

  useEffect(() => {
    if (phase === "outro") {
      const timer = setTimeout(() => setPhase("complete"), 2000);
      return () => clearTimeout(timer);
    }
    return undefined; // Explicit return for other phases
  }, [phase]);

  const handleNext = useCallback(() => {
    if (phase === "beats") {
      setCurrentBeatIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [phase, onComplete]);

  const handleSkip = useCallback(() => onSkip(), [onSkip]);
  const handleShare = useCallback(() => onShare?.(story), [onShare, story]);

  const currentBeat = phase === "beats" && currentBeatIndex >= 0 && currentBeatIndex < story.totalBeats ? story.beats[currentBeatIndex] : null;

  const getEmotionColor = (emotion: EmotionalArc): string => {
    const colors: Record<EmotionalArc, string> = {
      TRIUMPH: theme.colors.success.DEFAULT,
      MASTERY: theme.colors.primary[500],
      RESILIENCE: theme.colors.warning.DEFAULT,
      DETERMINATION: theme.colors.info.DEFAULT,
      ANTICIPATION: theme.colors.primary[400],
      WONDER: theme.colors.primary[300],
      GRATITUDE: theme.colors.success.light,
      RELIEF: theme.colors.success.light,
    };
    return colors[emotion] ?? theme.colors.primary[500];
  };

  const emotionColor = currentBeat ? getEmotionColor(currentBeat.emotion) : getEmotionColor(story.overallEmotion);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      {/* Background gradient effect */}
      <View style={{ position: "absolute", top: -200, left: -200, right: -200, bottom: -200, borderRadius: 400, backgroundColor: `${emotionColor}15` }} />

      {/* Header with skip button */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 16, paddingTop: 32 }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {story.beats.map((_, index) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index <= currentBeatIndex ? emotionColor : theme.colors.border.DEFAULT,
              }}
            />
          ))}
        </View>

        <Pressable onPress={handleSkip} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "500", color: theme.colors.text.muted }}>Skip</Text>
        </Pressable>
      </View>

      {/* Main content */}
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Phase: Intro */}
        {phase === "intro" && (
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 2, marginBottom: 16, color: theme.colors.text.secondary }}>YOUR SESSION STORY</Text>
            <Text style={{ fontSize: 32, fontWeight: "800", textAlign: "center", marginBottom: 12, color: theme.colors.text.primary }}>{story.title}</Text>
            {story.subtitle && <Text style={{ fontSize: 16, textAlign: "center", color: theme.colors.text.secondary }}>{story.subtitle}</Text>}
          </View>
        )}

        {/* Phase: Beats */}
        {phase === "beats" && currentBeat && <StoryBeatView beat={currentBeat} emotionColor={emotionColor} isReducedMotion={isReducedMotion} />}

        {/* Phase: Outro */}
        {phase === "outro" && (
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12, color: theme.colors.text.primary }}>Story Complete</Text>
            <Text style={{ fontSize: 16, textAlign: "center", color: theme.colors.text.secondary }}>{story.nextSessionHooks.length > 0 ? story.nextSessionHooks[0].description : "Ready for your next chapter?"}</Text>
          </View>
        )}

        {/* Phase: Complete - Action buttons */}
        {phase === "complete" && (
          <View style={{ width: "100%", alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 24, color: theme.colors.text.primary }}>Session Complete</Text>

            {/* Hooks for next session */}
            {story.nextSessionHooks.length > 0 && (
              <View style={{ width: "100%", marginBottom: 32 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 12, color: theme.colors.text.secondary }}>NEXT SESSION</Text>
                {story.nextSessionHooks.slice(0, 2).map((hook, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 8,
                      backgroundColor: hook.urgency === "HIGH" ? `${theme.colors.error.DEFAULT}15` : `${theme.colors.primary[500]}10`,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", flex: 1, color: theme.colors.text.primary }}>{hook.description}</Text>
                    {hook.urgency === "HIGH" && (
                      <View style={{ width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", marginLeft: 12, backgroundColor: theme.colors.error.DEFAULT }}>
                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>!</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Action buttons */}
            <View style={{ width: "100%", gap: 12 }}>
              {onShare && (
                <Pressable style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: theme.colors.border.DEFAULT }} onPress={handleShare}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: theme.colors.text.primary }}>Share Story</Text>
                </Pressable>
              )}

              <Pressable style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: emotionColor }} onPress={handleNext}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Continue</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Tap to continue indicator */}
      {(phase === "beats" || phase === "outro") && (
        <Pressable style={{ position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center" }} onPress={handleNext}>
          <Text style={{ fontSize: 14, fontWeight: "500", color: theme.colors.text.muted }}>Tap to continue</Text>
        </Pressable>
      )}
    </View>
  );
};

// ============================================================================
// Story Beat View Component
// ============================================================================

interface StoryBeatViewProps {
  beat: StoryBeat;
  emotionColor: string;
  isReducedMotion: boolean;
}

const StoryBeatView: React.FC<StoryBeatViewProps> = ({ beat, emotionColor, isReducedMotion }) => {
  const { theme } = useTheme();
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  useEffect(() => {
    // Reset and animate in
    fadeAnim.value = 0;
    slideAnim.value = 50;

    fadeAnim.value = withTiming(1, { duration: isReducedMotion ? 100 : 500 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, [beat.id, fadeAnim, slideAnim, isReducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  // Get visual cue element
  const renderVisualCue = () => {
    switch (beat.visualCue) {
      case "STREAK_FLAME":
        return (
          <View style={{ width: 120, height: 120, borderRadius: 60, justifyContent: "center", alignItems: "center", marginBottom: 32, backgroundColor: `${emotionColor}20` }}>
            <Text style={{ fontSize: 48 }}>🔥</Text>
            {beat.metadata?.value && <Text style={{ position: "absolute", bottom: -8, fontSize: 20, fontWeight: "800", color: emotionColor }}>{beat.metadata.value}</Text>}
          </View>
        );
      case "BOSS_DAMAGE":
        return (
          <View style={{ width: 120, height: 120, borderRadius: 60, justifyContent: "center", alignItems: "center", marginBottom: 32, backgroundColor: `${emotionColor}20` }}>
            <Text style={{ fontSize: 48 }}>⚔️</Text>
            {beat.metadata?.value && <Text style={{ position: "absolute", bottom: -8, fontSize: 20, fontWeight: "800", color: emotionColor }}>-{beat.metadata.value}</Text>}
          </View>
        );
      case "BADGE_SHINE":
        return (
          <View style={{ width: 120, height: 120, borderRadius: 60, justifyContent: "center", alignItems: "center", marginBottom: 32, backgroundColor: `${emotionColor}20` }}>
            <Text style={{ fontSize: 48 }}>🏆</Text>
          </View>
        );
      case "CELEBRATION":
        return (
          <View style={{ width: 120, height: 120, borderRadius: 60, justifyContent: "center", alignItems: "center", marginBottom: 32, backgroundColor: `${emotionColor}20` }}>
            <Text style={{ fontSize: 48 }}>✨</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[{ alignItems: "center", width: "100%" }, animatedStyle]}>
      {renderVisualCue()}

      <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 12, lineHeight: 36, color: theme.colors.text.primary }}>{beat.headline}</Text>

      {beat.subtext && <Text style={{ fontSize: 16, textAlign: "center", lineHeight: 24, marginBottom: 20, color: theme.colors.text.secondary }}>{beat.subtext}</Text>}

      {beat.metadata?.context && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: `${emotionColor}20` }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: emotionColor }}>{beat.metadata.context}</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default PostSessionStoryScreen;
