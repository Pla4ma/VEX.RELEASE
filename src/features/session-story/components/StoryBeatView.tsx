import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
import type { StoryBeat } from "../schemas";

interface StoryBeatViewProps {
  beat: StoryBeat;
  emotionColor: string;
  isReducedMotion: boolean;
}

export const StoryBeatView: React.FC<StoryBeatViewProps> = ({
  beat,
  emotionColor,
  isReducedMotion,
}) => {
  const { theme } = useTheme();
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  useEffect(() => {
    fadeAnim.value = 0;
    slideAnim.value = 50;
    fadeAnim.value = withTiming(1, { duration: isReducedMotion ? 100 : 500 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, [beat.id, fadeAnim, slideAnim, isReducedMotion]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));
  const renderVisualCue = () => {
    switch (beat.visualCue) {
      case "STREAK_FLAME":
        return (
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 32,
              backgroundColor: `${emotionColor}20`,
            }}
          >
            <Text style={{ fontSize: 48 }}>🔥</Text>
            {beat.metadata?.value && (
              <Text
                style={{
                  position: "absolute",
                  bottom: -8,
                  fontSize: 20,
                  fontWeight: "800",
                  color: emotionColor,
                }}
              >
                {beat.metadata.value}
              </Text>
            )}
          </View>
        );
      case "BOSS_DAMAGE":
        return (
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 32,
              backgroundColor: `${emotionColor}20`,
            }}
          >
            <Text style={{ fontSize: 48 }}>⚔️</Text>
            {beat.metadata?.value && (
              <Text
                style={{
                  position: "absolute",
                  bottom: -8,
                  fontSize: 20,
                  fontWeight: "800",
                  color: emotionColor,
                }}
              >
                -{beat.metadata.value}
              </Text>
            )}
          </View>
        );
      case "BADGE_SHINE":
        return (
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 32,
              backgroundColor: `${emotionColor}20`,
            }}
          >
            <Text style={{ fontSize: 48 }}>🏆</Text>
          </View>
        );
      case "CELEBRATION":
        return (
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 32,
              backgroundColor: `${emotionColor}20`,
            }}
          >
            <Text style={{ fontSize: 48 }}>✨</Text>
          </View>
        );
      default:
        return null;
    }
  };
  return (
    <Animated.View
      style={[{ alignItems: "center", width: "100%" }, animatedStyle]}
    >
      {renderVisualCue()}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          textAlign: "center",
          marginBottom: 12,
          lineHeight: 36,
          color: theme.colors.text.primary,
        }}
      >
        {beat.headline}
      </Text>
      {beat.subtext && (
        <Text
          style={{
            fontSize: 16,
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 20,
            color: theme.colors.text.secondary,
          }}
        >
          {beat.subtext}
        </Text>
      )}
      {beat.metadata?.context && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: `${emotionColor}20`,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: emotionColor }}>
            {beat.metadata.context}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};
