import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { CARD_WIDTH } from "./session-consequence-types";

interface ChallengeImpactCardProps {
  challengeName: string;
  progressBefore: number;
  progressAfter: number;
  target: number;
  wasCompleted: boolean;
}

export function ChallengeImpactCard({
  challengeName,
  progressBefore,
  progressAfter,
  target,
  wasCompleted,
}: ChallengeImpactCardProps): JSX.Element {
  const { theme } = useTheme();
  const progressAnim = useSharedValue(progressBefore);

  useEffect(() => {
    progressAnim.value = withTiming(progressAfter, { duration: 1000 });
  }, [progressAfter, progressAnim]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, (progressAnim.value / target) * 100)}%`,
  }));

  return (
    <View
      style={{
        width: CARD_WIDTH,
        padding: theme.spacing[4],
        backgroundColor: wasCompleted
          ? `${theme.colors.success[500]}15`
          : theme.colors.background.secondary,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: wasCompleted
          ? theme.colors.success[500]
          : theme.colors.border.DEFAULT,
        marginRight: theme.spacing[3],
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing[2],
          marginBottom: theme.spacing[2],
        }}
      >
        <Text fontSize={24}>{wasCompleted ? "📋✅" : "📋"}</Text>
        <Text
          variant="body"
          fontWeight="700"
          color="text.primary"
          numberOfLines={1}
        >
          {wasCompleted ? "Challenge Complete!" : challengeName}
        </Text>
      </View>

      <View
        style={{
          height: 8,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.full,
          overflow: "hidden",
          marginBottom: theme.spacing[2],
        }}
      >
        <Animated.View
          style={[
            {
              height: "100%",
              backgroundColor: wasCompleted
                ? theme.colors.success[500]
                : theme.colors.primary[500],
              borderRadius: theme.borderRadius.full,
            },
            progressBarStyle,
          ]}
        />
      </View>

      <Text variant="caption" color="text.secondary">
        {wasCompleted
          ? `Completed! ${progressBefore} → ${progressAfter}/${target}`
          : `Progress: ${progressBefore} → ${progressAfter}/${target}`}
      </Text>
    </View>
  );
}
