import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import type { Theme } from "@/theme";
import type { StoryBeat } from "../schemas";
import { launchColors } from '@theme/tokens/launch-colors';


interface StoryBeatCardProps {
  beat: StoryBeat;
  emotionColor: string;
  theme: Theme;
}

export const StoryBeatCard: React.FC<StoryBeatCardProps> = ({
  beat,
  emotionColor,
  theme,
}) => {
  const slideAnim = useSharedValue(30);
  useEffect(() => {
    slideAnim.value = 30;
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, [beat.id, slideAnim]);
  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));
  const getIcon = (type: StoryBeat["type"]): string => {
    const icons: Record<string, string> = {
      OPENING: "🌅",
      FOCUS_JOURNEY: "🎯",
      STREAK_MOMENT: "🔥",
      BOSS_BATTLE: "⚔️",
      MILESTONE_REACHED: "🏆",
      PERFECTION_MOMENT: "✨",
      COMEBACK_TRIUMPH: "🦅",
      PROGRESSION_CLIFFHANGER: "📈",
      ACHIEVEMENT_UNLOCK: "🎖️",
      CLOSING_REFLECTION: "🌟",
    };
    return icons[type] ?? "📝";
  };
  return (
    <Animated.View
      style={[{ alignItems: "center", width: "100%" }, slideStyle]}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
          backgroundColor: `${emotionColor}20`,
        }}
      >
        <Text style={{ fontSize: 36 }}>{getIcon(beat.type)}</Text>
      </View>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          textAlign: "center",
          marginBottom: 12,
          lineHeight: 36,
          color: theme.colors.text?.primary ?? launchColors.hex_fff,
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
            color: theme.colors.text?.secondary ?? launchColors.hex_aaa,
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
          <Text
            style={{ fontSize: 14, fontWeight: "600", color: emotionColor }}
          >
            {beat.metadata.context}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};
