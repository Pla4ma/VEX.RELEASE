import React from "react";
import { View } from "react-native";
import { Pressable } from "react-native";
import { Text } from "@/components/primitives/Text";
import { useTheme } from "@/theme";
import { getMinTouchTargetStyle } from "@/utils/touchTarget";
import type { LearnedItem } from "../schemas";

function confidenceColor(
  confidence: LearnedItem["confidence"],
  theme: ReturnType<typeof useTheme>["theme"],
): string {
  switch (confidence) {
    case "strong":
      return theme.colors.semantic.info;
    case "medium":
      return theme.colors.text.secondary;
    case "weak":
      return theme.colors.text.tertiary;
  }
}

function confidenceLabel(confidence: LearnedItem["confidence"]): string {
  switch (confidence) {
    case "strong":
      return "Strong evidence";
    case "medium":
      return "Some evidence";
    case "weak":
      return "Limited evidence";
  }
}

export function LearnedItemRow({
  item,
  onEditItem,
  onDeleteItem,
  onHideItem,
}: {
  item: LearnedItem;
  onEditItem?: (item: LearnedItem) => void;
  onDeleteItem?: (item: LearnedItem) => void;
  onHideItem?: (item: LearnedItem) => void;
}): React.ReactElement {
  const { theme } = useTheme();
  if (item.deletedByUser || !item.userVisible) {
    return React.createElement(React.Fragment, null);
  }

  return React.createElement(View, {
    style: {
      backgroundColor: theme.colors.background.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
      borderLeftWidth: 3,
      borderLeftColor: confidenceColor(item.confidence, theme),
    },
  }, [
    React.createElement(View, {
      key: "row",
      style: { flexDirection: "row", alignItems: "flex-start" },
    }, [
      React.createElement(View, { key: "content", style: { flex: 1 } }, [
        React.createElement(Text, {
          key: "observation",
          style: {
            color: theme.colors.text.primary,
            fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.semibold,
            lineHeight: 20,
            marginBottom: theme.spacing.xs,
          },
        }, item.observation),
        React.createElement(Text, {
          key: "confidence",
          style: {
            color: confidenceColor(item.confidence, theme),
            fontSize: theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.medium,
            marginBottom: theme.spacing.sm,
          },
        }, confidenceLabel(item.confidence)),
        React.createElement(Text, {
          key: "evidence",
          style: {
            color: theme.colors.text.secondary,
            fontSize: theme.typography.sizes.sm,
            lineHeight: 18,
          },
        }, item.evidence),
      ]),
    ]),
    React.createElement(View, {
      key: "actions",
      style: {
        flexDirection: "row",
        marginTop: theme.spacing.sm,
        gap: theme.spacing.sm,
      },
    }, [
      onEditItem &&
        React.createElement(Pressable, {
          key: "edit",
          accessibilityLabel: "Edit this observation",
          accessibilityRole: "button",
          onPress: () => onEditItem(item),
          style: [
            getMinTouchTargetStyle(),
            { paddingVertical: 6, paddingHorizontal: 12 },
          ],
        }, React.createElement(Text, {
          style: {
            color: theme.colors.semantic.info,
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.medium,
          },
        }, "Edit")),
      onHideItem &&
        React.createElement(Pressable, {
          key: "hide",
          accessibilityLabel: "Hide this observation",
          accessibilityRole: "button",
          accessibilityHint: "Removes this item from view but keeps the data",
          onPress: () => onHideItem(item),
          style: [
            getMinTouchTargetStyle(),
            { paddingVertical: 6, paddingHorizontal: 12 },
          ],
        }, React.createElement(Text, {
          style: {
            color: theme.colors.text.tertiary,
            fontSize: theme.typography.sizes.sm,
          },
        }, "Hide")),
      onDeleteItem &&
        React.createElement(Pressable, {
          key: "delete",
          accessibilityLabel: "Delete this observation",
          accessibilityRole: "button",
          accessibilityHint: "Permanently removes this observation",
          onPress: () => onDeleteItem(item),
          style: [
            getMinTouchTargetStyle(),
            { paddingVertical: 6, paddingHorizontal: 12 },
          ],
        }, React.createElement(Text, {
          style: {
            color: theme.colors.semantic.error,
            fontSize: theme.typography.sizes.sm,
          },
        }, "Delete")),
    ]),
  ]);
}
