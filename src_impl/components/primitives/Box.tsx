/**
 * Box Component
 *
 * Primitive layout component - the building block for all layouts.
 */

import React, { type ReactNode } from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";
import type { SpacingValue, ColorValue } from "./types";
import type { SpacingScale } from "../../theme/types";

/**
 * Box component props
 */
export interface BoxProps extends Omit<ViewProps, "style"> {
  /** Flex direction */
  flex?: ViewStyle["flex"];
  flexDirection?: ViewStyle["flexDirection"];
  flexWrap?: ViewStyle["flexWrap"];
  justifyContent?: ViewStyle["justifyContent"];
  alignItems?: ViewStyle["alignItems"];
  alignContent?: ViewStyle["alignContent"];
  alignSelf?: ViewStyle["alignSelf"];

  /** Spacing */
  margin?: SpacingValue;
  m?: SpacingValue;
  mt?: SpacingValue;
  mr?: SpacingValue;
  mb?: SpacingValue;
  ml?: SpacingValue;
  mx?: SpacingValue;
  my?: SpacingValue;
  p?: SpacingValue;
  padding?: SpacingValue;
  pt?: SpacingValue;
  pr?: SpacingValue;
  pb?: SpacingValue;
  pl?: SpacingValue;
  px?: SpacingValue;
  py?: SpacingValue;

  /** Sizing */
  width?: ViewStyle["width"];
  height?: ViewStyle["height"];
  aspectRatio?: ViewStyle["aspectRatio"];
  minWidth?: ViewStyle["minWidth"];
  minHeight?: ViewStyle["minHeight"];
  maxWidth?: ViewStyle["maxWidth"];
  maxHeight?: ViewStyle["maxHeight"];

  /** Positioning */
  position?: ViewStyle["position"];
  top?: ViewStyle["top"];
  right?: ViewStyle["right"];
  bottom?: ViewStyle["bottom"];
  left?: ViewStyle["left"];
  zIndex?: ViewStyle["zIndex"];

  /** Appearance */
  bg?: ColorValue;
  backgroundColor?: ColorValue;
  opacity?: ViewStyle["opacity"];
  shadow?: boolean;
  borderRadius?: ViewStyle["borderRadius"];
  borderWidth?: ViewStyle["borderWidth"];
  borderColor?: ColorValue;
  borderLeftWidth?: ViewStyle["borderLeftWidth"];
  borderLeftColor?: ColorValue;
  borderRightWidth?: ViewStyle["borderRightWidth"];
  borderRightColor?: ColorValue;
  borderTopWidth?: ViewStyle["borderTopWidth"];
  borderTopColor?: ColorValue;
  borderBottomWidth?: ViewStyle["borderBottomWidth"];
  borderBottomColor?: ColorValue;
  overflow?: ViewStyle["overflow"];

  /** Gap between children */
  gap?: SpacingValue;

  /** Children */
  children?: ReactNode;

  /** Additional styles */
  style?: StyleProp<ViewStyle>;
}

/**
 * String token to numeric key mapping
 */
const spacingTokenMap: Record<string, keyof SpacingScale> = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "8": 8,
  "10": 10,
  "12": 12,
  "16": 16,
  "20": 20,
  "24": 24,
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 6,
  "2xl": 8,
  "3xl": 12,
};

/**
 * Resolve spacing value to pixels
 */
function resolveSpacing(value: SpacingValue | undefined, theme: ReturnType<typeof useTheme>["theme"]): number | `${number}%` | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    if (value.endsWith("%")) {
      return value as `${number}%`;
    }
    const key = spacingTokenMap[value];
    if (key !== undefined && key in theme.spacing) {
      return theme.spacing[key as keyof typeof theme.spacing];
    }
  }
  return undefined;
}

/**
 * Box component
 */
export function Box({ flex, flexDirection, flexWrap, justifyContent, alignItems, alignContent, alignSelf, margin, m, mt, mr, mb, ml, mx, my, p, padding, pt, pr, pb, pl, px, py, width, height, aspectRatio, minWidth, minHeight, maxWidth, maxHeight, position, top, right, bottom, left, zIndex, bg, backgroundColor, opacity, shadow, borderRadius, borderWidth, borderColor, borderLeftWidth, borderLeftColor, borderRightWidth, borderRightColor, borderTopWidth, borderTopColor, borderBottomWidth, borderBottomColor, overflow, children, style, ...props }: BoxProps): JSX.Element {
  const { theme } = useTheme();

  const boxStyle: ViewStyle = {
    // Flex
    flex,
    flexDirection,
    flexWrap,
    justifyContent,
    alignItems,
    alignContent,
    alignSelf,

    // Margin
    margin: resolveSpacing(m, theme) ?? resolveSpacing(margin, theme),
    marginTop: resolveSpacing(mt, theme) ?? resolveSpacing(my, theme),
    marginRight: resolveSpacing(mr, theme) ?? resolveSpacing(mx, theme),
    marginBottom: resolveSpacing(mb, theme) ?? resolveSpacing(my, theme),
    marginLeft: resolveSpacing(ml, theme) ?? resolveSpacing(mx, theme),

    // Padding
    padding: resolveSpacing(p, theme) ?? resolveSpacing(padding, theme),
    paddingTop: resolveSpacing(pt, theme) ?? resolveSpacing(py, theme),
    paddingRight: resolveSpacing(pr, theme) ?? resolveSpacing(px, theme),
    paddingBottom: resolveSpacing(pb, theme) ?? resolveSpacing(py, theme),
    paddingLeft: resolveSpacing(pl, theme) ?? resolveSpacing(px, theme),

    // Sizing
    width,
    height,
    aspectRatio,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,

    // Positioning
    position,
    top,
    right,
    bottom,
    left,
    zIndex,

    // Appearance
    backgroundColor: bg ?? backgroundColor,
    opacity,
    shadowOpacity: shadow ? 0.16 : undefined,
    shadowRadius: shadow ? 12 : undefined,
    elevation: shadow ? 4 : undefined,
    borderRadius,
    borderWidth,
    borderColor,
    borderLeftWidth,
    borderLeftColor,
    borderRightWidth,
    borderRightColor,
    borderTopWidth,
    borderTopColor,
    borderBottomWidth,
    borderBottomColor,
    overflow,
  };

  return (
    <View style={[boxStyle, style]} {...props}>
      {children}
    </View>
  );
}

/**
 * Create a specialized Box variant
 */
export function createBox(defaultProps: Partial<BoxProps>) {
  return function BoxVariant(props: BoxProps): JSX.Element {
    return <Box {...defaultProps} {...props} />;
  };
}
