import React from "react";
import { View, Text } from "react-native";
import type { SessionStory } from "../schemas";

interface PostStoryIntroOutroProps {
  phase: "intro" | "outro";
  story: SessionStory;
  theme: {
    colors: {
      text: { primary: string; secondary: string };
    };
  };
}

export const PostStoryIntroOutro: React.FC<PostStoryIntroOutroProps> = ({
  phase,
  story,
  theme,
}) => {
  if (phase === "intro") {
    return (
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 2,
            marginBottom: 16,
            color: theme.colors.text.secondary,
          }}
        >
          YOUR SESSION STORY
        </Text>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            textAlign: "center",
            marginBottom: 12,
            color: theme.colors.text.primary,
          }}
        >
          {story.title}
        </Text>
        {story.subtitle && (
          <Text
            style={{
              fontSize: 16,
              textAlign: "center",
              color: theme.colors.text.secondary,
            }}
          >
            {story.subtitle}
          </Text>
        )}
      </View>
    );
  }
  return (
    <View style={{ alignItems: "center" }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 12,
          color: theme.colors.text.primary,
        }}
      >
        Story Complete
      </Text>
      <Text
        style={{
          fontSize: 16,
          textAlign: "center",
          color: theme.colors.text.secondary,
        }}
      >
        {story.nextSessionHooks.length > 0
          ? story.nextSessionHooks[0]!.description
          : "Ready for your next chapter?"}
      </Text>
    </View>
  );
};
