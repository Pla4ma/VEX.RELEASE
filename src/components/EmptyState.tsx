import React from "react";
import { View } from "react-native";

import { useTheme } from "../theme";
import { Button } from "./primitives/Button";
import { Text } from "./primitives/Text";

interface EmptyStateProps {
  icon: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: EmptyStateProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: theme.spacing[5],
        paddingVertical: theme.spacing[8],
        gap: theme.spacing[3],
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.semantic.primarySoft,
          borderColor: theme.colors.semantic.border,
          borderWidth: 1,
        }}
      >
        <Text fontSize={48} lineHeight={48}>
          {icon}
        </Text>
      </View>
      <View style={{ alignItems: "center", gap: theme.spacing[2] }}>
        <Text
          variant="h4"
          fontSize={20}
          fontWeight="800"
          textAlign="center"
          color={theme.colors.text.primary}
        >
          {title}
        </Text>
        <Text
          variant="bodySmall"
          textAlign="center"
          color={theme.colors.text.secondary}
          style={{ maxWidth: 320 }}
        >
          {body}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Button
          accessibilityHint="Activates this empty state action"
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={onAction}
          variant="outline"
        >
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

export default EmptyState;
