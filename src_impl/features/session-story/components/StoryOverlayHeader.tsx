import React from "react";
import { View, Text, Pressable } from "react-native";
import type { StoryBeat } from "../schemas";

interface StoryOverlayHeaderProps {
  beats: StoryBeat[];
  currentBeatIndex: number;
  emotionColor: string;
  onSkip: () => void;
  borderColor: string;
  mutedColor: string;
}

export const StoryOverlayHeader: React.FC<StoryOverlayHeaderProps> = ({
  beats,
  currentBeatIndex,
  emotionColor,
  onSkip,
  borderColor,
  mutedColor,
}) => {
  return (
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
        {beats.map((_beat: StoryBeat, index: number) => (
          <View
            key={index}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor:
                index <= currentBeatIndex
                  ? emotionColor
                  : borderColor,
            }}
          />
        ))}
      </View>
      <Pressable
        onPress={onSkip}
        style={{ paddingHorizontal: 12, paddingVertical: 6 }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: mutedColor,
          }}
        >
          Skip Story
        </Text>
      </Pressable>
    </View>
  );
};
