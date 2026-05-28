import React from "react";
import { View } from "react-native";

import { getPremiumCardStyle } from "../../../components/premiumStyles";
import { Button } from "../../../components/primitives/Button";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

export function ProgressPreviewCard({
  body,
  ctaLabel,
  eyebrow,
  onPress,
  title,
}: {
  body: string;
  ctaLabel: string;
  eyebrow: string;
  onPress: () => void;
  title: string;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[4],
        gap: theme.spacing[3],
        ...getPremiumCardStyle("medium"),
      }}
    >
      <Text variant="label" color={theme.colors.text.secondary}>
        {eyebrow}
      </Text>
      <Text variant="h4" color={theme.colors.text.primary}>
        {title}
      </Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>
        {body}
      </Text>
      <Button
        variant="outline"
        onPress={onPress}
        accessibilityLabel="Action button"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        {ctaLabel}
      </Button>
    </View>
  );
}

export function ReturnReasonCard({
  body,
  ctaLabel,
  eyebrow,
  onDismiss,
  onPress,
  tone = "default",
  title,
}: {
  body: string;
  ctaLabel: string;
  eyebrow: string;
  onDismiss?: () => void;
  onPress: () => void;
  tone?: "default" | "celebration" | "info" | "warning";
  title: string;
}) {
  const { theme } = useTheme();
  const toneStyles = {
    celebration: {
      backgroundColor: theme.colors.surface.selected,
      borderColor: theme.colors.primary[200],
    },
    default: {
      backgroundColor: theme.colors.background.secondary,
      borderColor: theme.colors.primary[100],
    },
    info: {
      backgroundColor: theme.colors.info[50],
      borderColor: theme.colors.info[500],
    },
    warning: {
      backgroundColor: theme.colors.warning[50],
      borderColor: theme.colors.warning[500],
    },
  }[tone];

  return (
    <View
      style={{
        borderWidth: 1,
        padding: theme.spacing[4],
        gap: theme.spacing[3],
        ...toneStyles,
        ...getPremiumCardStyle("large"),
      }}
    >
      <Text variant="label" color={theme.colors.primary[500]}>
        {eyebrow}
      </Text>
      <Text variant="h4" color={theme.colors.text.primary}>
        {title}
      </Text>
      <Text variant="bodySmall" color={theme.colors.text.secondary}>
        {body}
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.spacing[3],
        }}
      >
        <Button
          onPress={onPress}
          accessibilityLabel="Action button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          {ctaLabel}
        </Button>
        {onDismiss ? (
          <Button
            variant="outline"
            onPress={onDismiss}
            accessibilityLabel="Dismiss button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            Dismiss
          </Button>
        ) : null}
      </View>
    </View>
  );
}
