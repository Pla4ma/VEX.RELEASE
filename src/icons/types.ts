/**
 * Icon Type Definitions
 *
 * TypeScript interfaces for the icon system.
 */

import type { SvgProps } from 'react-native-svg';

/**
 * Icon size variants
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/**
 * Icon color variants
 */
export type IconColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'inverse'
  | 'current';

/**
 * Icon stroke width
 */
export type IconStrokeWidth = 'thin' | 'normal' | 'thick';

/**
 * Icon variant
 */
export type IconVariant = 'outline' | 'solid' | 'mini';

/**
 * Icon props
 */
import type { ViewStyle } from 'react-native';

export interface IconProps extends Omit<SvgProps, 'color' | 'width' | 'height'> {
  /**
   * Additional styles for the icon container
   */
  style?: ViewStyle;
  /**
   * Icon name
   */
  name: string;

  /**
   * Icon size
   * @default 'md'
   */
  size?: IconSize | number;

  /**
   * Icon color
   * @default 'current'
   */
  color?: IconColor | string;

  /**
   * Icon variant
   * @default 'outline'
   */
  variant?: IconVariant;

  /**
   * Stroke width for outline icons
   * @default 'normal'
   */
  strokeWidth?: IconStrokeWidth | number;

  /**
   * Whether the icon should animate
   * @default false
   */
  animated?: boolean;

  /**
   * Animation type when animated
   * @default 'pulse'
   */
  animation?: 'pulse' | 'spin' | 'bounce';

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Accessibility hint
   */
  accessibilityHint?: string;
}

/**
 * Icon button props
 */
export interface IconButtonProps extends IconProps {
  /**
   * Button press handler
   */
  onPress?: () => void;

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Button style
   */
  style?: ViewStyle;

  /**
   * Hit slop for touch area
   */
  hitSlop?: number;

  /**
   * Whether to show press feedback
   * @default true
   */
  pressable?: boolean;
}

/**
 * Icon registry entry
 */
export interface IconRegistryEntry {
  /**
   * Icon name
   */
  name: string;

  /**
   * SVG path data for outline variant
   */
  outline?: string;

  /**
   * SVG path data for solid variant
   */
  solid?: string;

  /**
   * SVG path data for mini variant
   */
  mini?: string;

  /**
   * Default viewBox
   * @default '0 0 24 24'
   */
  viewBox?: string;
}

/**
 * Icon collection
 */
export type IconCollection = Record<string, IconRegistryEntry>;

/**
 * Icon size values in pixels
 */
export const ICON_SIZE_VALUES: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

/**
 * Icon stroke width values
 */
export const ICON_STROKE_WIDTH_VALUES: Record<IconStrokeWidth, number> = {
  thin: 1,
  normal: 1.5,
  thick: 2,
};
