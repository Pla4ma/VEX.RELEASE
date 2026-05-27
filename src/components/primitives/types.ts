import type { ViewStyle } from "react-native";
export type SpacingValue =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "8"
  | "10"
  | "12"
  | "16"
  | "20"
  | "24"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | number
  | `${number}%`;
export type ColorValue = string;
export type ResponsiveValue<T> = T | { [key: string]: T };
export interface CommonPrimitiveProps {
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessible?: boolean;
  accessibilityRole?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
}
export interface BoxStyleProps {
  bg?: ColorValue;
  borderRadius?: keyof ViewStyle["borderRadius"] | number;
  borderWidth?: number;
  borderColor?: ColorValue;
  shadow?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  opacity?: number;
}
export interface LayoutProps {
  width?: ViewStyle["width"];
  height?: ViewStyle["height"];
  minWidth?: ViewStyle["minWidth"];
  minHeight?: ViewStyle["minHeight"];
  maxWidth?: ViewStyle["maxWidth"];
  maxHeight?: ViewStyle["maxHeight"];
}
export interface FlexProps {
  flex?: ViewStyle["flex"];
  flexDirection?: ViewStyle["flexDirection"];
  flexWrap?: ViewStyle["flexWrap"];
  justifyContent?: ViewStyle["justifyContent"];
  alignItems?: ViewStyle["alignItems"];
  alignContent?: ViewStyle["alignContent"];
  alignSelf?: ViewStyle["alignSelf"];
  gap?: number;
  rowGap?: number;
  columnGap?: number;
}
export interface SpacingProps {
  m?: SpacingValue;
  mt?: SpacingValue;
  mr?: SpacingValue;
  mb?: SpacingValue;
  ml?: SpacingValue;
  mx?: SpacingValue;
  my?: SpacingValue;
  p?: SpacingValue;
  pt?: SpacingValue;
  pr?: SpacingValue;
  pb?: SpacingValue;
  pl?: SpacingValue;
  px?: SpacingValue;
  py?: SpacingValue;
}
export interface PositionProps {
  position?: ViewStyle["position"];
  top?: ViewStyle["top"];
  right?: ViewStyle["right"];
  bottom?: ViewStyle["bottom"];
  left?: ViewStyle["left"];
  zIndex?: ViewStyle["zIndex"];
}
