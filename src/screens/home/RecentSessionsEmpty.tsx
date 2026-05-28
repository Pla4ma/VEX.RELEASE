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
          Your first win unlocks the board
        </Text>
        <Text variant="body" color={theme.colors.text.secondary}>
          Start a focus session or study from content to fill this feed with
          your last three runs.
        </Text>
        <Button
          onPress={onStart}
          accessibilityLabel="Start session button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
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
        icon="⏱️"
        title="No sessions yet"
        body="Start a focus session to build your recent activity board and track your daily rhythm."
        actionLabel="Start session"
        onAction={onStart}
      />
    </View>
  );
}
