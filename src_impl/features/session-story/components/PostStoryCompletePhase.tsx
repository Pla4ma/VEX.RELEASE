import React from "react";
import { View, Text, Pressable } from "react-native";
import type { SessionStory } from "../schemas";
import { launchColors } from '@theme/tokens/launch-colors';


interface PostStoryCompletePhaseProps {
  story: SessionStory;
  emotionColor: string;
  hasShare: boolean;
  handleShare: () => void;
  handleNext: () => void;
  theme: {
    colors: {
      text: { primary: string; secondary: string; muted?: string };
      error: { DEFAULT: string };
      primary: Record<number, string>;
      border: { DEFAULT: string };
    };
  };
}

export const PostStoryCompletePhase: React.FC<
  PostStoryCompletePhaseProps
> = ({ story, emotionColor, hasShare, handleShare, handleNext, theme }) => {
  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          marginBottom: 24,
          color: theme.colors.text.primary,
        }}
      >
        Session Complete
      </Text>

      {story.nextSessionHooks.length > 0 && (
        <View style={{ width: "100%", marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 1,
              marginBottom: 12,
              color: theme.colors.text.secondary,
            }}
          >
            NEXT SESSION
          </Text>
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
                backgroundColor:
                  hook.urgency === "HIGH"
                    ? `${theme.colors.error.DEFAULT}15`
                    : `${theme.colors.primary[500]}10`,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  flex: 1,
                  color: theme.colors.text.primary,
                }}
              >
                {hook.description}
              </Text>
              {hook.urgency === "HIGH" && (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: 12,
                    backgroundColor: theme.colors.error.DEFAULT,
                  }}
                >
                  <Text
                    style={{
                      color: launchColors.hex_fff,
                      fontSize: 14,
                      fontWeight: "800",
                    }}
                  >
                    !
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={{ width: "100%", gap: 12 }}>
        {hasShare && (
          <Pressable
            style={{
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.border.DEFAULT,
            }}
            onPress={handleShare}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: theme.colors.text.primary,
              }}
            >
              Share Story
            </Text>
          </Pressable>
        )}

        <Pressable
          style={{
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            backgroundColor: emotionColor,
          }}
          onPress={handleNext}
        >
          <Text style={{ color: launchColors.hex_fff, fontSize: 16, fontWeight: "700" }}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
