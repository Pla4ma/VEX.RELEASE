/**
 * Primitive Component Types
 *
 * Shared types for primitive components.
 */

import type { ViewStyle } from 'react-native';

/**
 * Spacing value - can be theme token key or number
 */
export type SpacingValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | number | `${number}%`;

/**
 * Color value - can be theme token or color string
 */
export type ColorValue = string;

/**
 * Responsive value
 */
export type ResponsiveValue<T> = T | { [key: string]: T };

/**
 * Common primitive props
 */
export interface CommonPrimitiveProps {
  /** Test ID */
  testID?: string;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Accessibility hint */
  accessibilityHint?: string;

  /** Whether element is accessible */
  accessible?: boolean;

  /** Accessibility role */
  accessibilityRole?: string;

  /** Accessibility state */
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
}

/**
 * Box style props
 */
export interface BoxStyleProps {
  /** Background color */
  bg?: ColorValue;

  /** Border radius */
  borderRadius?: keyof ViewStyle['borderRadius'] | number;

  /** Border width */
  borderWidth?: number;

  /** Border color */
  borderColor?: ColorValue;

  /** Shadow/elevation */
  shadow?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Opacity */
  opacity?: number;
}

/**
 * Layout props
 */
export interface LayoutProps {
  /** Width */
  width?: ViewStyle['width'];

  /** Height */
  height?: ViewStyle['height'];

  /** Minimum width */
  minWidth?: ViewStyle['minWidth'];

  /** Minimum height */
  minHeight?: ViewStyle['minHeight'];

  /** Maximum width */
  maxWidth?: ViewStyle['maxWidth'];

  /** Maximum height */
  maxHeight?: ViewStyle['maxHeight'];
}

/**
 * Flex props
 */
export interface FlexProps {
  /** Flex grow */
  flex?: ViewStyle['flex'];

  /** Flex direction */
  flexDirection?: ViewStyle['flexDirection'];

  /** Flex wrap */
  flexWrap?: ViewStyle['flexWrap'];

  /** Justify content */
  justifyContent?: ViewStyle['justifyContent'];

  /** Align items */
  alignItems?: ViewStyle['alignItems'];

  /** Align content */
  alignContent?: ViewStyle['alignContent'];

  /** Align self */
  alignSelf?: ViewStyle['alignSelf'];

  /** Gap */
  gap?: number;

  /** Row gap */
  rowGap?: number;

  /** Column gap */
  columnGap?: number;
}

/**
 * Spacing shorthand props
 */
export interface SpacingProps {
  /** Margin */
  m?: SpacingValue;

  /** Margin top */
  mt?: SpacingValue;

  /** Margin right */
  mr?: SpacingValue;

  /** Margin bottom */
  mb?: SpacingValue;

  /** Margin left */
  ml?: SpacingValue;

  /** Margin horizontal (x-axis) */
  mx?: SpacingValue;

  /** Margin vertical (y-axis) */
  my?: SpacingValue;

  /** Padding */
  p?: SpacingValue;

  /** Padding top */
  pt?: SpacingValue;

  /** Padding right */
  pr?: SpacingValue;

  /** Padding bottom */
  pb?: SpacingValue;

  /** Padding left */
  pl?: SpacingValue;

  /** Padding horizontal (x-axis) */
  px?: SpacingValue;

  /** Padding vertical (y-axis) */
  py?: SpacingValue;
}

/**
 * Position props
 */
export interface PositionProps {
  /** Position type */
  position?: ViewStyle['position'];

  /** Top offset */
  top?: ViewStyle['top'];

  /** Right offset */
  right?: ViewStyle['right'];

  /** Bottom offset */
  bottom?: ViewStyle['bottom'];

  /** Left offset */
  left?: ViewStyle['left'];

  /** Z-index */
  zIndex?: ViewStyle['zIndex'];
}
