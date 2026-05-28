import React from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Text } from "../../../components/primitives/Text";
import { Box } from "../../../components/primitives/Box";
import type { Theme } from "../../../theme";

interface ScoreOverviewCardProps {
  theme: Theme;
  month: string;
  endingScore: number;
  grade: string;
  change: number;
  scoreColor: string;
}

export function ScoreOverviewCard({
  theme,
  month,
  endingScore,
  grade,
  change,
  scoreColor,
}: ScoreOverviewCardProps): JSX.Element {
  return (
    <Animated.View entering={FadeIn.delay(100).duration(300)}>
      <Box
        backgroundColor="surface"
        borderRadius="xl"
        padding="xl"
        style={{ marginBottom: theme.spacing[6] }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View>
            <Text variant="heading3" color="textSecondary">
              {new Date(month + "-01").toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Text
              variant="display"
              color="text"
              style={{ marginTop: theme.spacing[2], fontWeight: "700" }}
            >
              {endingScore}
            </Text>
            <Text variant="body" color="textSecondary">
              Focus Score
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: theme.spacing[3],
              paddingVertical: theme.spacing[2],
              borderRadius: theme.borderRadius.lg,
              backgroundColor: scoreColor + "20",
              minWidth: 60,
              alignItems: "center",
            }}
          >
            <Text
              variant="heading2"
              style={{ fontWeight: "700", color: scoreColor }}
            >
              {grade}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: theme.spacing[4] }}>
          <Text
            variant="body"
            style={{
              fontWeight: "600",
              color:
                change > 0
                  ? theme.colors.success.DEFAULT
                  : theme.colors.error.DEFAULT,
            }}
          >
            {change > 0 ? "↑" : "↓"} {Math.abs(change)} from last month
          </Text>
        </View>
      </Box>
    </Animated.View>
  );
}
