import React from "react";
import { View } from "react-native";

import { EmptyState } from "../../components/EmptyState";
import { Button } from "../../components/primitives/Button";
import { Text } from "../../components/primitives/Text";
import { getPremiumCardStyle } from "../../components/premiumStyles";
import { useTheme } from "../../theme";
import { styles } from "./homeScreenCardStyles";

export function RecentSessionsEmpty({
  isFirstRun,
  onStart,
}: {
  isFirstRun: boolean;
  onStart: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  if (isFirstRun) {
    return (
      <View
        style={[
          styles.card,
          getPremiumCardStyle("large"),
          styles.studyCard,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.border.light,
            padding: theme.spacing[4],
          },
        ]}
      >
        <Text variant="h4" color={theme.colors.text.primary}>
          One session changes what you see here
        </Text>
        <Text variant="body" color={theme.colors.text.secondary}>
          Start a focus session or study from content. VEX will build your
          recent activity from real sessions.
        </Text>
        <Button
          onPress={onStart}
          accessibilityLabel="Start session"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          Start session
        </Button>
      </View>
    );
  }
  return (
    <View
      style={[
        styles.card,
        getPremiumCardStyle("large"),
        {
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.light,
        },
      ]}
    >
      <EmptyState
        icon="\u23F1\uFE0F"
        title="No sessions yet"
        body="Start a focus session. VEX builds your activity feed from what you actually finish."
        actionLabel="Start session"
        onAction={onStart}
      />
    </View>
  );
}
