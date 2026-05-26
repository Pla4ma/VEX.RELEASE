import React from "react";
import { View, Text } from "react-native";
import type { Theme } from "@/theme";
import type { StoryBeat } from "../schemas";
import { launchColors } from '@theme/tokens/launch-colors';


interface StoryBeatContentProps {
  beat: StoryBeat;
  theme: Theme;
}

export const StoryBeatContent: React.FC<StoryBeatContentProps> = ({
  beat,
  theme,
}) => {
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
  const getEmotionColor = (emotion: StoryBeat["emotion"]): string => {
    const colors: Record<string, string> = {
      TRIUMPH: theme.colors.success?.DEFAULT ?? launchColors.hex_22c55e,
      MASTERY: theme.colors.primary?.[500] ?? launchColors.hex_3b82f6,
      RESILIENCE: theme.colors.warning?.DEFAULT ?? launchColors.hex_f59e0b,
      DETERMINATION: theme.colors.info?.DEFAULT ?? launchColors.hex_3b82f6,
      ANTICIPATION: theme.colors.primary?.[400] ?? launchColors.hex_60a5fa,
      WONDER: theme.colors.primary?.[400] ?? launchColors.hex_60a5fa,
      GRATITUDE: theme.colors.success?.DEFAULT ?? launchColors.hex_22c55e,
      RELIEF: theme.colors.success?.DEFAULT ?? launchColors.hex_22c55e,
    };
    return colors[emotion] ?? theme.colors.primary?.[500] ?? launchColors.hex_3b82f6;
  };
  const emotionColor = getEmotionColor(beat.emotion);
  return (
    <View style={{ alignItems: "center", width: "100%" }}>
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
    </View>
  );
};
