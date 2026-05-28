import type {
  StyleProp,
  ViewProps,
  ViewStyle,
} from "react-native";
import type { ReactNode } from "react";
import type { SpacingValue, ColorValue } from "./types";

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
