import React from "react";
import { View } from "react-native";

import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

export function ProgressionStatCard({
  detail,
  label,
  tone,
  value,
}: {
  detail: string;
  label: string;
  tone: "default" | "success" | "warning";
  value: string;
}): JSX.Element {
  const { theme } = useTheme();
  const toneColor =
    tone === "success"
      ? theme.colors.success[500]
      : tone === "warning"
        ? theme.colors.warning[500]
        : theme.colors.text.primary;

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface.card,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        flexBasis: "47%",
        flexGrow: 1,
        gap: theme.spacing[1],
        padding: theme.spacing[3],
      }}
    >
      <Text variant="caption" color={theme.colors.text.tertiary}>
        {label}
      </Text>
      <Text variant="h4" color={toneColor}>
        {value}
      </Text>
      <Text variant="caption" color={theme.colors.text.secondary}>
        {detail}
      </Text>
    </View>
  );
}
