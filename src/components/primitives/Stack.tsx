/**
 * Stack Component
 *
 * Flexbox layout primitive for consistent spacing and alignment.
 *
 * @phase 4
 */

import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../../theme";
import type { SpacingValue } from "./types";

// ============================================================================
// Types
// ============================================================================

export interface StackProps extends ViewProps {
  /** Direction of the stack */
  direction?: "row" | "column";
  /** Gap between children */
  gap?: SpacingValue;
  /** Horizontal alignment */
  align?: ViewStyle["alignItems"];
  /** Vertical alignment */
  justify?: ViewStyle["justifyContent"];
  /** Whether to wrap children */
  wrap?: boolean;
  /** Padding on all sides */
  padding?: SpacingValue;
  /** Background color */
  background?: "primary" | "secondary" | "card" | "transparent";
  /** Border radius */
  radius?: "none" | "sm" | "md" | "lg" | "xl";
  /** Flex grow */
  flex?: number;
}

function resolveSpacing(
  value: SpacingValue | undefined,
  theme: ReturnType<typeof useTheme>["theme"],
): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "number") {
    return value;
  }
  if (value === "xs") {
    return theme.spacing[1];
  }
  if (value === "sm") {
    return theme.spacing[2];
  }
  if (value === "md") {
    return theme.spacing[4];
  }
  if (value === "lg") {
    return theme.spacing[6];
  }
  if (value === "xl") {
    return theme.spacing[8];
  }
  if (value === "2xl") {
    return theme.spacing[12];
  }
  if (value === "3xl") {
    return theme.spacing[16];
  }
  switch (value) {
    case "0":
      return theme.spacing[0];
    case "1":
      return theme.spacing[1];
    case "2":
      return theme.spacing[2];
    case "3":
      return theme.spacing[3];
    case "4":
      return theme.spacing[4];
    case "5":
      return theme.spacing[5];
    case "6":
      return theme.spacing[6];
    case "8":
      return theme.spacing[8];
    case "10":
      return theme.spacing[10];
    case "12":
      return theme.spacing[12];
    case "16":
      return theme.spacing[16];
    case "20":
      return theme.spacing[20];
    case "24":
      return theme.spacing[24];
    default:
      return undefined;
  }
}

// ============================================================================
// Component
// ============================================================================

export const Stack: React.FC<StackProps> = ({
  direction = "column",
  gap,
  align,
  justify,
  wrap = false,
  padding,
  background = "transparent",
  radius = "none",
  flex,
  children,
  style,
  ...rest
}) => {
  const { theme } = useTheme();

  // Map spacing tokens
  const spacingValue = resolveSpacing(gap, theme);
  const paddingValue = resolveSpacing(padding, theme);

  // Background color
  const backgroundColor =
    background === "transparent"
      ? undefined
      : background === "card"
        ? theme.colors.surface.card
        : theme.colors.background[background];

  // Border radius
  const borderRadius =
    radius === "none" ? undefined : theme.borderRadius[radius];

  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap: spacingValue,
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? "wrap" : "nowrap",
          padding: paddingValue,
          backgroundColor,
          borderRadius,
          flex,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

// ============================================================================
// Preset Components
// ============================================================================

/** Vertical stack with default spacing */
export const VStack: React.FC<Omit<StackProps, "direction">> = (props) => (
  <Stack direction="column" {...props} />
);

/** Horizontal stack with default spacing */
export const HStack: React.FC<Omit<StackProps, "direction">> = (props) => (
  <Stack direction="row" {...props} />
);

/** Centered content stack */
export const Center: React.FC<Omit<StackProps, "align" | "justify">> = (
  props,
) => <Stack align="center" justify="center" flex={1} {...props} />;
