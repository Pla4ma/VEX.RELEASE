import React from "react";
import { View, Text, Pressable } from "react-native";
import type { SessionStory } from "../schemas";

interface PostStoryHeaderProps {
  story: SessionStory;
  emotionColor: string;
  currentBeatIndex: number;
  handleSkip: () => void;
  theme: {
    colors: {
      text: { muted: string };
      border: { DEFAULT: string };
    };
  };
}

export const PostStoryHeader: React.FC<PostStoryHeaderProps> = ({
  story,
  emotionColor,
  currentBeatIndex,
  handleSkip,
  theme,
}) => {
  return (
    <>
      <View
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          right: -200,
          bottom: -200,
          borderRadius: 400,
          backgroundColor: `${emotionColor}15`,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingBottom: 16,
          paddingTop: 32,
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
                    ? emotionColor
                    : theme.colors.border.DEFAULT,
              }}
            />
          ))}
        </View>
        <Pressable
          onPress={handleSkip}
          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: theme.colors.text.muted,
            }}
          >
            Skip
          </Text>
        </Pressable>
      </View>
    </>
  );
};
