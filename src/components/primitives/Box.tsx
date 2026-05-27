/**
 * Box Component
 *
 * Primitive layout component - the building block for all layouts.
 */

import React, { type ReactNode } from "react";
import {
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../../theme";
import type { SpacingValue, ColorValue } from "./types";
import { resolveColorValue, resolveSpacingValue } from "./theme-values";

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
 * Box component
 */
export function Box({
  flex,
  flexDirection,
  flexWrap,
  justifyContent,
  alignItems,
  alignContent,
  alignSelf,
  margin,
  m,
  mt,
  mr,
  mb,
  ml,
  mx,
  my,
  p,
  padding,
  pt,
  pr,
  pb,
  pl,
  px,
  py,
  width,
  height,
  aspectRatio,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  position,
  top,
  right,
  bottom,
  left,
  zIndex,
  bg,
  backgroundColor,
  opacity,
  shadow,
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
  children,
  style,
  ...props
}: BoxProps): JSX.Element {
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
    margin: resolveSpacingValue(m, theme) ?? resolveSpacingValue(margin, theme),
    marginTop: resolveSpacingValue(mt, theme) ?? resolveSpacingValue(my, theme),
    marginRight:
      resolveSpacingValue(mr, theme) ?? resolveSpacingValue(mx, theme),
    marginBottom:
      resolveSpacingValue(mb, theme) ?? resolveSpacingValue(my, theme),
    marginLeft:
      resolveSpacingValue(ml, theme) ?? resolveSpacingValue(mx, theme),

    // Padding
    padding:
      resolveSpacingValue(p, theme) ?? resolveSpacingValue(padding, theme),
    paddingTop:
      resolveSpacingValue(pt, theme) ?? resolveSpacingValue(py, theme),
    paddingRight:
      resolveSpacingValue(pr, theme) ?? resolveSpacingValue(px, theme),
    paddingBottom:
      resolveSpacingValue(pb, theme) ?? resolveSpacingValue(py, theme),
    paddingLeft:
      resolveSpacingValue(pl, theme) ?? resolveSpacingValue(px, theme),

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
    backgroundColor: resolveColorValue(bg ?? backgroundColor, theme),
    opacity,
    shadowOpacity: shadow ? 0.16 : undefined,
    shadowRadius: shadow ? 12 : undefined,
    elevation: shadow ? 4 : undefined,
    borderRadius,
    borderWidth,
    borderColor: resolveColorValue(borderColor, theme),
    borderLeftWidth,
    borderLeftColor: resolveColorValue(borderLeftColor, theme),
    borderRightWidth,
    borderRightColor: resolveColorValue(borderRightColor, theme),
    borderTopWidth,
    borderTopColor: resolveColorValue(borderTopColor, theme),
    borderBottomWidth,
    borderBottomColor: resolveColorValue(borderBottomColor, theme),
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
