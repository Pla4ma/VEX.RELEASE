import React from "react";
import { View } from "react-native";
import { Pressable } from "react-native";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { getMinTouchTargetStyle } from "../../../utils/touchTarget";
import { LearnedItemRow } from "./LearnedItemRow";
import type { LearnedItem, WhatVEXLearned } from "../schemas";

interface Props {
  data: WhatVEXLearned;
  onEditItem?: (item: LearnedItem) => void;
  onDeleteItem?: (item: LearnedItem) => void;
  onHideItem?: (item: LearnedItem) => void;
  onDismiss?: () => void;
}

export function WhatVEXLearnedView({
  data,
  onEditItem,
  onDeleteItem,
  onHideItem,
  onDismiss,
}: Props): React.ReactElement {
  const { theme } = useTheme();

  if (!data.hasEnoughEvidence) {
    return React.createElement(View, {
      style: {
        backgroundColor: theme.colors.background.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xl,
        alignItems: "center",
      },
    }, [
      React.createElement(Text, {
        key: "title",
        style: {
          color: theme.colors.text.primary,
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.semibold,
          marginBottom: theme.spacing.sm,
        },
      }, "What VEX learned"),
      React.createElement(Text, {
        key: "empty",
        style: {
          color: theme.colors.text.secondary,
          fontSize: theme.typography.sizes.md,
          lineHeight: 20,
          textAlign: "center",
        },
      }, "Not enough session data yet. Complete a few more sessions and VEX will share what it observes."),
    ]);
  }

  return React.createElement(View, {
    style: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
  }, [
    React.createElement(View, {
      key: "header",
      style: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.md,
      },
    }, [
      React.createElement(Text, {
        key: "title",
        style: {
          color: theme.colors.text.primary,
          fontSize: theme.typography.sizes.xl,
          fontWeight: theme.typography.weights.semibold,
        },
      }, "What VEX learned"),
      onDismiss &&
        React.createElement(Pressable, {
          key: "dismiss",
          accessibilityLabel: "Dismiss",
          accessibilityRole: "button",
          onPress: onDismiss,
          style: [getMinTouchTargetStyle(), { padding: theme.spacing.sm }],
        }, React.createElement(Text, {
          style: {
            color: theme.colors.text.tertiary,
            fontSize: theme.typography.sizes.lg,
          },
        }, "\u00D7")),
    ]),
    ...data.items.map((item) =>
      React.createElement(LearnedItemRow, {
        key: item.id,
        item,
        onEditItem,
        onDeleteItem,
        onHideItem,
      }),
    ),
    React.createElement(View, {
      key: "disclaimer",
      style: {
        backgroundColor: theme.colors.semantic.warningLight,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        marginTop: theme.spacing.sm,
      },
    }, React.createElement(Text, {
      style: {
        color: theme.colors.semantic.warning,
        fontSize: theme.typography.sizes.xs,
        lineHeight: 16,
      },
    }, data.disclaimer)),
  ]);
}
